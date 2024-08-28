from IPython.display import display, HTML
from visualizer import plot_3d_trajectory, create_slider
import numpy as np
from scipy.integrate import odeint


def rossler_system(state, t, a, b, c):
    """
    Calculates the derivatives of the Rössler system at a given state.
    Parameters:
    state (list): A list containing the current values of x, y, and z.
    t (float): The current time.
    a (float): The value of the parameter a.
    b (float): The value of the parameter b.
    c (float): The value of the parameter c.
    Returns:
    list: A list containing the derivatives of x, y, and z.
    """
    
    x, y, z = state
    dx = -y - z
    dy = x + a * y
    dz = b + z * (x - c)
    return [dx, dy, dz]

def visualize_rossler(a=0.2, b=0.2, c=5.7, initial_state=[1, 1, 1], t_span=(0, 500), num_points=10000):
    """
    Visualizes the Rössler attractor.
    Parameters:
    - a (float): The 'a' parameter of the Rössler system. Default is 0.2.
    - b (float): The 'b' parameter of the Rössler system. Default is 0.2.
    - c (float): The 'c' parameter of the Rössler system. Default is 5.7.
    - initial_state (list): The initial state of the system. Default is [1, 1, 1].
    - t_span (tuple): The time span for integration. Default is (0, 500).
    - num_points (int): The number of points to generate. Default is 10000.
    Returns:
    None
    """

    t = np.linspace(t_span[0], t_span[1], num_points)
    states = odeint(rossler_system, initial_state, t, args=(a, b, c))
    plot_3d_trajectory(t, states, f"Rössler Attractor (a={a}, b={b}, c={c})")

# Create interactive sliders for parameters
display(create_slider(0, 1, 0.01, 0.2, "a"))
display(create_slider(0, 1, 0.01, 0.2, "b"))
display(create_slider(0, 10, 0.1, 5.7, "c"))

# Run the visualization
visualize_rossler()