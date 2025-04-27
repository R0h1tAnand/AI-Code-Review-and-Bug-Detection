import re
import difflib

# Basic refactor rule-based optimizations
def basic_optimize_code(user_code):
    # Fix common syntax issues like 'total + = i' -> 'total += i'
    user_code = re.sub(r'(\w+)\s*\+\s*=\s*(\w+)', r'\1 += \2', user_code)

    # Replace 'for' loops with sum operation where applicable
    user_code = re.sub(r'for\s+(\w+)\s+in\s+(\w+):\s*(\w+)\s*\+=\s*\1',
                       r'\3 = sum(\2)', user_code)

    # Refactor nested loops where possible (simple case example)
    user_code = re.sub(r'for\s+(\w+)\s+in\s+(\w+):\s+for\s+(\w+)\s+in\s+(\w+):',
                       r'for \3 in \4: # Nested loop optimized', user_code)
    
    # Remove unused temporary variables
    user_code = re.sub(r'\btemp\b.*?\n', '', user_code)  # Remove lines with unused 'temp' variable
    
    # Correct loops that simply append to a list
    user_code = re.sub(r'for\s+(\w+)\s+in\s+(\w+):\s*(\w+)\.append\(\1\)',
                       r'\3.extend(\2)', user_code)
    
    # Additional improvements (e.g., change `range(len(...))` to direct iteration over list)
    user_code = re.sub(r'for\s+(\w+)\s+in\s+range\((\w+)\):',
                       r'for \1 in \2:', user_code)

    return user_code

# Simulate Codex or GPT-based improvements (you could integrate an actual model API here)
def ai_refactor_code(user_code):
    # Example: Replacing inefficient loops with more efficient patterns
    user_code = user_code.replace('for i in range(len(numbers)):', 'for i in numbers:')
    
    # Fixing redundant temporary variables (example)
    user_code = user_code.replace('temp = 0', '# Unnecessary variable removed')

    return user_code

# Function to generate diff between original and optimized code
def generate_diff(original_code, optimized_code):
    diff = difflib.unified_diff(
        original_code.splitlines(), 
        optimized_code.splitlines(), 
        fromfile='Original Code', 
        tofile='Optimized Code', 
        lineterm=''
    )
    
    return '\n'.join(diff)

# Enhanced process to show original and optimized code
def process_file(file_path):
    try:
        # Open the file and read its content
        with open(file_path, 'r') as file:
            user_code = file.read()

        # First, apply basic optimizations (fix loops, syntax errors)
        optimized_code_basic = basic_optimize_code(user_code)
        
        # Then, simulate more advanced AI refactoring (like Codex or GPT-3)
        optimized_code_advanced = ai_refactor_code(optimized_code_basic)
        
        # Output the original and optimized code
        print("📄 Original Code:")
        print(user_code)
        
        print("\n✅ Optimized Code:")
        print(optimized_code_advanced)
        
        print("\n🔧 Changes Made:")
        changes = generate_diff(user_code, optimized_code_advanced)
        print(changes)
        
    except FileNotFoundError:
        print("❌ Error: The file was not found. Please check the file path.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Ask for the file path
    file_path = input("📥 Enter the path to the Python file (.py): ")
    process_file(file_path)
