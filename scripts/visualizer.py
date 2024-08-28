import numpy as np
from scipy.integrate import odeint
import plotly.graph_objects as go
from IPython.display import display, HTML

def plot_3d_trajectory(t, states, title):
    """
    Plots a 3D trajectory using the given time steps, states, and title.
    Parameters:
    - t (array-like): The time steps.
    - states (array-like): The states of the trajectory.
    - title (str): The title of the plot.
    Returns:
    None
    """

    fig = go.Figure(data=[go.Scatter3d(
        x=states[:, 0],
        y=states[:, 1],
        z=states[:, 2],
        mode='lines',
        line=dict(width=2)
    )])
    
    fig.update_layout(
        title=title,
        scene=dict(
            xaxis_title='X',
            yaxis_title='Y',
            zaxis_title='Z'
        ),
        width=800,
        margin=dict(r=20, b=10, l=10, t=40)
    )
    
    fig.show()

# Helper function to create an interactive slider
def create_slider(min_value, max_value, step, initial_value, id):
    """
    Creates an HTML slider element with the specified parameters.
    Parameters:
    min_value (int or float): The minimum value of the slider.
    max_value (int or float): The maximum value of the slider.
    step (int or float): The step size of the slider.
    initial_value (int or float): The initial value of the slider.
    id (str): The id attribute of the slider element.
    Returns:
    str: The HTML code for the slider element.
    Example:
    create_slider(0, 100, 1, 50, 'slider1')
    """

    return HTML(f"""
    <input type="range" min="{min_value}" max="{max_value}" step="{step}" value="{initial_value}" id="{id}">
    <span id="{id}_value">{initial_value}</span>
    <script>
        var slider = document.getElementById('{id}');
        var output = document.getElementById('{id}_value');
        slider.oninput = function() {{
            output.innerHTML = this.value;
        }}
    </script>
    """)