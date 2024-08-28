from IPython.display import display, HTML
from visualizer import plot_3d_trajectory, create_slider
import numpy as np
from scipy.integrate import odeint


def lorenz_system(state, t, sigma, rho, beta):
    """
    Calculates the derivatives of the Lorenz system at a given state.
    Parameters:
    - state (list): A list containing the current values of the variables x, y, and z.
    - t (float): The current time.
    - sigma (float): The sigma parameter of the Lorenz system.
    - rho (float): The rho parameter of the Lorenz system.
    - beta (float): The beta parameter of the Lorenz system.
    Returns:
    - list: A list containing the derivatives of the variables x, y, and z.
    """


    x, y, z = state
    dx = sigma * (y - x)
    dy = x * (rho - z) - y
    dz = x * y - beta * z
    return [dx, dy, dz]

def visualize_lorenz(sigma=10, rho=28, beta=8/3, initial_state=[1, 1, 1], t_span=(0, 100), num_points=10000):
    """
    Visualizes the Lorenz attractor.
    Parameters:
    - sigma (float): The sigma parameter of the Lorenz system. Default is 10.
    - rho (float): The rho parameter of the Lorenz system. Default is 28.
    - beta (float): The beta parameter of the Lorenz system. Default is 8/3.
    - initial_state (list): The initial state of the Lorenz system. Default is [1, 1, 1].
    - t_span (tuple): The time span for integration. Default is (0, 100).
    - num_points (int): The number of points to generate. Default is 10000.
    """

    t = np.linspace(t_span[0], t_span[1], num_points)
    states = odeint(lorenz_system, initial_state, t, args=(sigma, rho, beta))
    plot_3d_trajectory(t, states, f"Lorenz Attractor (σ={sigma}, ρ={rho}, β={beta})")

# Create interactive sliders for parameters
display(create_slider(0, 50, 0.1, 10, "sigma"))
display(create_slider(0, 50, 0.1, 28, "rho"))
display(create_slider(0, 10, 0.1, 8/3, "beta"))

# Run the visualization
visualize_lorenz()