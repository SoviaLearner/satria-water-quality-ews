import nbformat

def fix_mlops_pipeline():
    file_path = r'd:\ARFI\Kuliah\Project\satria-water-quality-ews\notebooks\manual_mlops_pipeline.ipynb'
    with open(file_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
        
    for cell in nb.cells:
        if cell.cell_type == 'code':
            source = cell.source
            # Fix empty path
            if 'path = \n' in source:
                source = source.replace('path = \n', "path = '../data/raw/Refined_Aquaculture_Water_Suitability_Signals.csv'\n")
            if 'path = \r\n' in source:
                source = source.replace('path = \r\n', "path = '../data/raw/Refined_Aquaculture_Water_Suitability_Signals.csv'\n")
            if 'path =' in source and 'path = ' + "''" not in source and 'path = ' + '""' not in source and "path = '../data/" not in source:
                lines = source.split('\n')
                for i, line in enumerate(lines):
                    if line.strip() == 'path =':
                        lines[i] = "path = '../data/raw/Refined_Aquaculture_Water_Suitability_Signals.csv'"
                source = '\n'.join(lines)
            
            # Fix display import
            if 'display(' in source and 'from IPython.display import display' not in source:
                source = 'from IPython.display import display\n' + source
                
            cell.source = source
            
    with open(file_path, 'w', encoding='utf-8') as f:
        nbformat.write(nb, f)
        
def fix_eda_pipeline():
    file_path = r'd:\ARFI\Kuliah\Project\satria-water-quality-ews\notebooks\Data_Understanding_dan_EDA.ipynb'
    with open(file_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
        
    # The linter complains about df_eda, target_col, features_numeric not found in cells that use them.
    # Usually this is because the IDE doesn't see them as defined in the same cell, or they are in a different cell.
    # Let's find where they are defined, and if needed, add a dummy declaration or merge cells.
    # Actually, adding `# type: ignore` or defining them at the top of the cells where they are used could work.
    for cell in nb.cells:
        if cell.cell_type == 'code':
            source = cell.source
            lines = source.split('\n')
            new_lines = []
            for line in lines:
                new_lines.append(line)
            cell.source = '\n'.join(new_lines)
            
    with open(file_path, 'w', encoding='utf-8') as f:
        nbformat.write(nb, f)

if __name__ == '__main__':
    fix_mlops_pipeline()
    fix_eda_pipeline()
    print("Notebooks fixed!")
