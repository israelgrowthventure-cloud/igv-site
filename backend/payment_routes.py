"""
Monetico payment integration with HMAC security
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import hashlib
import hmac
from datetime import datetime
import os
import logging

router = APIRouter(prefix="/payment", tags=["payment"])

# Monetico Configuration
MONETICO_TPE = os.getenv("MONETICO_TPE", "")
MONETICO_KEY = os.getenv("MONETICO_KEY", "")
MONETICO_COMPANY_CODE = os.getenv("MONETICO_COMPANY_CODE", "")
MONETICO_URL = "https://p.monetico-services.com/paiement.cgi"

# Models
class PaymentRequest(BaseModel):
    pack_slug: str
    amount: float
    currency: str = "EUR"
    customer_email: EmailStr
    customer_name: str
    order_reference: str

class PaymentResponse(BaseModel):
    form_data: dict
    monetico_url: str

def generate_mac(data_string: str, key: str) -> str:
    """Generate HMAC-SHA1 MAC for Monetico"""
    mac = hmac.new(
        key.encode('utf-8'),
        data_string.encode('utf-8'),
        hashlib.sha1
    ).hexdigest()
    return mac

def create_monetico_form_data(
    amount: float,
    reference: str,
    email: str,
    context: dict
) -> dict:
    """Create Monetico payment form data with MAC"""
    
    # Format amount (with 2 decimals, no separators)
    monetico_amount = f"{amount:.2f}EUR"
    
    # Prepare data
    date_now = datetime.now().strftime("%d/%m/%Y:%H:%M:%S")
    
    # Context data (optional metadata)
    context_data = {
        "pack": context.get("pack", ""),
        "zone": context.get("zone", "EU")
    }
    
    # Build MAC string in exact order required by Monetico
    mac_string = (
        f"TPE={MONETICO_TPE}*"
        f"date={date_now}*"
        f"montant={monetico_amount}*"
        f"reference={reference}*"
        f"texte-libre=IGV*"
        f"version=3.0*"
        f"lgue=FR*"
        f"societe={MONETICO_COMPANY_CODE}*"
        f"mail={email}"
    )
    
    # Generate MAC
    mac = generate_mac(mac_string, MONETICO_KEY)
    
    # Form data to submit to Monetico
    form_data = {
        "TPE": MONETICO_TPE,
        "date": date_now,
        "montant": monetico_amount,
        "reference": reference,
        "MAC": mac,
        "url_retour": os.getenv("MONETICO_SUCCESS_URL", "http://localhost:3000/payment/success"),
        "url_retour_err": os.getenv("MONETICO_FAILURE_URL", "http://localhost:3000/payment/failure"),
        "url_retour_ok": os.getenv("MONETICO_SUCCESS_URL", "http://localhost:3000/payment/success"),
        "lgue": "FR",
        "societe": MONETICO_COMPANY_CODE,
        "texte-libre": "IGV",
        "mail": email,
        "version": "3.0"
    }
    
    return form_data

@router.post("/monetico/init", response_model=PaymentResponse)
async def init_monetico_payment(request: PaymentRequest):
    """Initialize Monetico payment and return form data"""
    
    if not MONETICO_TPE or not MONETICO_KEY:
        raise HTTPException(
            status_code=500,
            detail="Monetico credentials not configured"
        )
    
    try:
        # Create form data with MAC
        form_data = create_monetico_form_data(
            amount=request.amount,
            reference=request.order_reference,
            email=request.customer_email,
            context={
                "pack": request.pack_slug,
                "customer": request.customer_name
            }
        )
        
        return PaymentResponse(
            form_data=form_data,
            monetico_url=MONETICO_URL
        )
    
    except Exception as e:
        logging.error(f"Monetico payment init error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Payment initialization failed: {str(e)}"
        )

@router.post("/monetico/callback")
async def monetico_callback(request: Request):
    """Handle Monetico payment callback (return URL)"""
    
    form_data = await request.form()
    
    # Extract data
    reference = form_data.get("reference", "")
    montant = form_data.get("montant", "")
    code_retour = form_data.get("code-retour", "")
    mac_received = form_data.get("MAC", "")
    
    # Verify MAC
    mac_string = (
        f"reference={reference}*"
        f"montant={montant}*"
        f"code-retour={code_retour}"
    )
    mac_calculated = generate_mac(mac_string, MONETICO_KEY)
    
    if mac_received.upper() != mac_calculated.upper():
        logging.error(f"Invalid MAC for payment {reference}")
        raise HTTPException(status_code=400, detail="Invalid MAC signature")
    
    # Process payment based on return code
    if code_retour == "payetest" or code_retour == "paiement":
        # Payment successful
        logging.info(f"Payment successful for {reference}")
        # TODO: Update order status in database
        return {"status": "success", "reference": reference}
    else:
        # Payment failed
        logging.warning(f"Payment failed for {reference}: {code_retour}")
        return {"status": "failed", "reference": reference, "code": code_retour}

@router.get("/test-config")
async def test_monetico_config():
    """Test Monetico configuration (admin only)"""
    return {
        "configured": bool(MONETICO_TPE and MONETICO_KEY),
        "tpe": MONETICO_TPE[:4] + "****" if MONETICO_TPE else None,
        "has_key": bool(MONETICO_KEY),
        "company": MONETICO_COMPANY_CODE
    }
