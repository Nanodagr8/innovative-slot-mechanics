try:
    import streamlit
    print("STREAMLIT_OK")
except ImportError:
    print("STREAMLIT_MISSING")

try:
    import cvxpy
    print("CVXPY_OK")
except ImportError:
    print("CVXPY_MISSING")
