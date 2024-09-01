from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from scipy.integrate import odeint

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class SystemParams(BaseModel):
    system: str
    params: dict

def lorenz_system(state, t, sigma, rho, beta):
    x, y, z = state
    return [
        sigma * (y - x),
        x * (rho - z) - y,
        x * y - beta * z
    ]

def rossler_system(state, t, a, b, c):
    x, y, z = state
    return [
        -y - z,
        x + a * y,
        b + z * (x - c)
    ]

def henon_system(state, t, a, b):
    x, y = state
    # Henon map is a discrete system, hence t is not used, but kept for consistency
    return [
        y + 1 - a * x**2,
        b * x
    ]

def logistic_system(state, t, r):
    x = state
    return r * x * (1 - x)

@app.post("/api/generate_data")
async def generate_data(system_params: SystemParams):
    system = system_params.system
    params = system_params.params

    t = np.linspace(0, 100, 10000)
    
    if system == "lorenz":
        sigma = params.get('sigma', 10)
        rho = params.get('rho', 28)
        beta = params.get('beta', 8/3)
        initial_state = [1, 1, 1]
        states = odeint(lorenz_system, initial_state, t, args=(sigma, rho, beta))
        return {
            "x": states[:, 0].tolist(),
            "y": states[:, 1].tolist(),
            "z": states[:, 2].tolist(),
        }
    
    elif system == "rossler":
        a = params.get('a', 0.2)
        b = params.get('b', 0.2)
        c = params.get('c', 5.7)
        initial_state = [1, 1, 1]
        states = odeint(rossler_system, initial_state, t, args=(a, b, c))
        return {
            "x": states[:, 0].tolist(),
            "y": states[:, 1].tolist(),
            "z": states[:, 2].tolist(),
        }
    
    elif system == "henon":
        a = params.get('a', 1.4)
        b = params.get('b', 0.3)
        initial_state = [0, 0]
        num_steps = 10000
        states = np.zeros((num_steps, 2))
        states[0] = initial_state
        for i in range(1, num_steps):
            states[i] = henon_system(states[i-1], None, a, b)
        return {
            "x": states[:, 0].tolist(),
            "y": states[:, 1].tolist(),
        }
    
    elif system == "logistic":
        r = params.get('r', 3.8)
        x0 = params.get('x0', 0.1)
        num_steps = 10000
        x = np.zeros(num_steps)
        x[0] = x0
        for i in range(1, num_steps):
            x[i] = logistic_system(x[i-1], None, r)
        return {
            "x": x.tolist(),
        }

    return {"error": "System not recognized"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)