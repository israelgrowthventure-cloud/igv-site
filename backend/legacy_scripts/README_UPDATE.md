# Legacy Backend Scripts - Update

## Phase 1bis - December 7, 2025

### Additional Scripts Moved to Legacy

This directory now contains all diagnostic, testing, configuration, and maintenance scripts that are not required for the core application runtime.

#### Diagnostic Scripts
- analyze_events.py
- analyze_recent_events.py
- analyze_render_errors.py
- check_latest_deploys.py
- check_packs_content.py
- check_pages_integrity.py
- check_prod_endpoints.py
- check_python_version.py
- check_render_deploy_status.py
- check_render_status.py
- check_service_config.py
- check_user.py
- diagnose_admin_issues.py
- diagnose_checkout_bug.py
- diagnose_packs_pricing.py
- diagnose_render_status.py
- find_success.py
- get_render_logs.py
- get_service_details.py
- list_pages.py
- monitor_deploy.py
- render_diagnose.py
- watch_deploy.py

#### Testing Scripts
- test_admin_cms_prod.py
- test_admin_styled.py
- test_backend.py
- test_checkout_complete.py
- test_checkout_flow.py
- test_checkout_prod.py
- test_cms_backend_prod.py
- test_cms_full_page_production.py
- test_cms_pages_content.py
- test_complete_live.py
- test_dashboard_api.py
- test_editor_connected.py
- test_final_complete.py
- test_packs_live.py
- test_pages_api.py
- test_post_fix.py
- test_pricing_official.py
- test_production_complete.py
- test_production_final.py
- test_server_import.py
- test_visual_admin_home.py

#### Configuration Scripts
- add_env_vars_render.ps1
- add_pack_ids.py
- add_pack_slugs.py
- configure_render_env.ps1
- configure_render_services.py
- create_admin_account.py
- create_v2_admin.py
- init_db_production.py
- setup_env_simple.ps1

#### Maintenance Scripts
- fix_pricing.py
- force_redeploy_backend.py
- render_redeploy_cms_backend.py
- sync_real_pages_to_cms.py
- trigger_backend_deploy.py
- trigger_deploy.py
- trigger_manual_deploy.py
- update_all_pages_content.py
- update_home_content.py
- update_packs_official.py
- update_render_config.py
- update_service_config.py

## Core Files (Not in Legacy)

The following files remain in the backend root as they are essential for runtime:

### Critical Runtime Files
- **server.py** - Main FastAPI application
- **cms_routes.py** - CMS route handlers
- **pricing_config.py** - Pricing rules configuration
- **requirements.txt** - Python dependencies
- **runtime.txt** - Python version specification
- **render.yaml** - Render deployment configuration
- **.env** / **.env.example** - Environment configuration

### Essential Directories
- **config/** - Configuration files
- **__pycache__/** - Python bytecode cache
- **venv/** - Virtual environment

## Purpose of This Archive

All scripts in this directory were used during development, debugging, and deployment phases but are not required for the production application to function. They are preserved for:

1. **Historical Reference** - Understanding past debugging and configuration steps
2. **Emergency Diagnostics** - Available if production issues require deep investigation
3. **Migration Tasks** - One-time setup or data migration scripts
4. **Development Testing** - Local testing and validation scripts

## Security Note

Some scripts in this directory may contain references to environment variables or database operations. They should never be run in production without careful review, and any secrets should be provided via environment variables, never hardcoded.

## Last Updated
December 7, 2025 - Phase 1bis: Comprehensive backend cleanup
