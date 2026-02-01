import sys
import os

print("Verifying backend environment...")

try:
    import fastapi
    print(f"FastAPI verified: {fastapi.__version__}")
    import pandas
    print(f"Pandas verified: {pandas.__version__}")
    import sklearn
    print(f"Scikit-learn verified: {sklearn.__version__}")
    import xgboost
    print(f"XGBoost verified: {xgboost.__version__}")
    import shap
    print(f"SHAP verified: {shap.__version__}")
    import lime
    print("Lime verified")
    
    print("\nAll core dependencies importable.")
except ImportError as e:
    print(f"\nCRITICAL: Import missing - {e}")
    sys.exit(1)
except Exception as e:
    print(f"\nCRITICAL: Error verifying - {e}")
    sys.exit(1)
