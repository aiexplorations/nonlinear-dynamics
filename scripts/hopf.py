import numpy as np
from scipy.integrate import odeint
import plotly.graph_objects as go
from ipywidgets import interactive, FloatSlider

def hopf_system(state, t, mu, omega):
    x, y = state
    dx = mu * x - omega * y - x * (x**2 + y**2)
    dy = omega * x + mu * y - y * (x**2 + y**2)
    return [dx, dy]

def plot_hopf(mu, omega, initial_state=[1, 1], t_span=(0, 100), num_points=10000):
    t = np.linspace(t_span[0], t_span[1], num_points)
    states = odeint(hopf_system, initial_state, t, args=(mu, omega))
    
    fig = go.Figure()
    
    # Plot the trajectory
    fig.add_trace(go.Scatter(x=states[:, 0], y=states[:, 1], mode='lines', name='Trajectory'))
    
    # Plot the initial point
    fig.add_trace(go.Scatter(x=[initial_state[0]], y=[initial_state[1]], mode='markers', name='Initial Point', marker=dict(size=10, color='red')))
    
    fig.update_layout(
        title=f"Hopf Bifurcation (μ={mu:.2f}, ω={omega:.2f})",
        xaxis_title="x",
        yaxis_title="y",
        width=700,
        height=700,
        showlegend=True
    )
    
    fig.show()

# Create interactive sliders
interactive_plot = interactive(plot_hopf, 
                               mu=FloatSlider(min=-1, max=1, step=0.01, value=0),
                               omega=FloatSlider(min=0, max=5, step=0.1, value=1))

display(interactive_plot)