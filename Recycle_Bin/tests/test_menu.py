import gradio as gr

# Define the menu structure
menu_data = {
    "Home": [],
    "Patient": ["Login", "Register", "Schedule", "Prescriptions"],
    "Doctor": ["Login", "Register", "Appointments", "Search Patients", "Update Schedule"],
    "Admin": ["Register Patient", "Register Doctor", "Register Admin"]
}

def update_submenu(primary_choice):
    """Updates the second dropdown based on the first selection."""
    options = menu_data.get(primary_choice, [])
    
    # If no submenu exists (like for 'Home'), we hide the second dropdown
    if not options:
        return gr.Dropdown(choices=[], value=None, visible=False)
    
    # Return a visible dropdown with relevant choices
    return gr.Dropdown(choices=options, value=None, visible=True)

with gr.Blocks(title="Hospital Management System") as demo:
    gr.Markdown("# Hospital Management Menu")
    
    with gr.Row():
        # 1st Level Menu
        level1 = gr.Dropdown(
            choices=list(menu_data.keys()), 
            label="Main Menu",
            interactive=True
        )
        
        # 2nd Level Menu (Initially hidden/empty)
        level2 = gr.Dropdown(
            choices=[], 
            label="Sub Menu", 
            visible=False,
            interactive=True
        )

    # Output area to show final selection
    selection_output = gr.Textbox(label="Current Navigation", interactive=False)

    # Trigger update_submenu whenever level1 changes
    level1.change(fn=update_submenu, inputs=level1, outputs=level2)

    # Simple function to show what was selected
    def show_selection(l1, l2):
        if l2:
            return f"Navigating to: {l1} > {l2}"
        return f"Navigating to: {l1}"

    # Update output when either dropdown changes
    level1.change(show_selection, [level1, level2], selection_output)
    level2.change(show_selection, [level1, level2], selection_output)

if __name__ == "__main__":
    demo.launch()
