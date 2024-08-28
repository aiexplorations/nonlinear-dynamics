# backend/main.py
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

@app.post("/api/generate_data")
async def generate_data(system_params: SystemParams):
    if system_params.system == "lorenz":
        sigma = system_params.params.get('sigma', 10)
        rho = system_params.params.get('rho', 28)
        beta = system_params.params.get('beta', 8/3)
        
        initial_state = [1, 1, 1]
        t = np.linspace(0, 100, 10000)
        
        states = odeint(lorenz_system, initial_state, t, args=(sigma, rho, beta))
    
    elif system_params.system == "rossler":
        a = system_params.params.get('a', 0.2)
        b = system_params.params.get('b', 0.2)
        c = system_params.params.get('c', 5.7)
        
        initial_state = [1, 1, 1]
        t = np.linspace(0, 500, 10000)
        
        states = odeint(rossler_system, initial_state, t, args=(a, b, c))
    
    else:
        return {"error": "Unknown system"}

    return {
        "x": states[:, 0].tolist(),
        "y": states[:, 1].tolist(),
        "z": states[:, 2].tolist()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)