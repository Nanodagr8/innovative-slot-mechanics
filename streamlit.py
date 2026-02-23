class MockContainer:
    def __enter__(self): return self
    def __exit__(self, exc_type, exc_val, exc_tb): pass
    def write(self, *args): pass

class MockState:
    def __init__(self):
        self.app = None
    def __getitem__(self, key):
        return getattr(self, key, None)
    def __setitem__(self, key, value):
        setattr(self, key, value)
    def __contains__(self, key):
        return hasattr(self, key)

session_state = MockState()

def container(border=False): return MockContainer()
def expander(label): return MockContainer()
def subheader(text): pass
def write(*args): pass
def slider(label, min_v, max_v, value, step, key=None, on_change=None, args=None): return value
def button(label): return False
def rerun(): pass
def json(data): pass

sidebar = MockContainer()
