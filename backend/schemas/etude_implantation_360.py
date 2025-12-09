"""
Schémas Pydantic pour les leads Étude d'Implantation 360°
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime


class EtudeImplantation360LeadCreate(BaseModel):
    """Schéma pour créer un lead Étude 360°"""
    full_name: str = Field(..., min_length=1, max_length=200, description="Nom complet")
    work_email: EmailStr = Field(..., description="Email professionnel")
    role: Optional[str] = Field(None, max_length=200, description="Rôle / Fonction")
    brand_group: Optional[str] = Field(None, max_length=200, description="Marque / Groupe")
    implantation_horizon: Literal["0-6", "6-12", "12+", "unknown"] = Field(
        ..., description="Horizon d'implantation envisagé"
    )
    source: Optional[str] = Field(
        "etude_implantation_360_landing",
        max_length=100,
        description="Source du lead"
    )
    locale: Optional[str] = Field("fr", max_length=10, description="Langue du formulaire")

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Jean Dupont",
                "work_email": "jean.dupont@entreprise.com",
                "role": "Directeur Expansion",
                "brand_group": "Entreprise SAS",
                "implantation_horizon": "6-12",
                "source": "etude_implantation_360_landing",
                "locale": "fr"
            }
        }


class EtudeImplantation360LeadOut(BaseModel):
    """Schéma de réponse pour un lead créé"""
    id: str = Field(..., description="Identifiant du lead")
    work_email: EmailStr = Field(..., description="Email professionnel")
    full_name: str = Field(..., description="Nom complet")
    created_at: datetime = Field(..., description="Date de création")
    status: str = Field(default="new", description="Statut du lead")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "work_email": "jean.dupont@entreprise.com",
                "full_name": "Jean Dupont",
                "created_at": "2025-12-08T17:00:00Z",
                "status": "new"
            }
        }
