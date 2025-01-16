#include <iostream>
#include <string>

void showConsoleMessage(bool showConsole, bool runLoading) {
    if (showConsole && !runLoading) {
        std::cout << "Console is visible. You can see the output!" << std::endl;
    } else if (runLoading) {
        std::cout << "Loading... Please wait." << std::endl;
    } else {
        std::cout << "Console is hidden." << std::endl;
    }
}

int main() {
    bool showConsole = true;  // Change this to false to hide the console
    bool runLoading = false;  // Change this to true to simulate loading

    // Call the function to show the appropriate message
    showConsoleMessage(showConsole, runLoading);

    return 0; // Indicate that the program ended successfully
}