// run_production.go
// Go wrapper that launches Laravel backend and frontend dev server, then opens the browser.
package main

import (
    "fmt"
    "os"
    "os/exec"
    "syscall"
    "time"
)

func main() {
    // Get project root (directory where this binary resides)
    dir, err := os.Getwd()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Failed to get working directory: %v\n", err)
        os.Exit(1)
    }
    fmt.Printf("Running from %s\n", dir)

    // Start Laravel backend
    backendCmd := exec.Command("php", "artisan", "serve", "--host=127.0.0.1", "--port=8000")
    backendCmd.Stdout = os.Stdout
    backendCmd.Stderr = os.Stderr
    backendCmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
    fmt.Println("Starting Laravel backend...")
    if err := backendCmd.Start(); err != nil {
        fmt.Fprintf(os.Stderr, "Failed to start Laravel server: %v\n", err)
        os.Exit(1)
    }

    // Start frontend (assumes npm script "dev" in ./frontend)
    frontendPath := fmt.Sprintf("%s%cfrontend", dir, os.PathSeparator)
    frontendCmd := exec.Command("npm", "run", "dev")
    frontendCmd.Dir = frontendPath
    frontendCmd.Stdout = os.Stdout
    frontendCmd.Stderr = os.Stderr
    frontendCmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
    fmt.Println("Starting frontend dev server...")
    if err := frontendCmd.Start(); err != nil {
        fmt.Fprintf(os.Stderr, "Failed to start frontend server: %v\n", err)
        // Continue; backend may still be useful
    }

    // Give servers a moment to start, then open default browser
    time.Sleep(5 * time.Second)
    fmt.Println("Opening browser at http://127.0.0.1:8000")
    exec.Command("cmd", "/c", "start", "http://127.0.0.1:8000").Start()

    // Wait for backend (and frontend if started) to exit when user closes the exe
    fmt.Println("Press Ctrl+C to stop both servers.")
    if err := backendCmd.Wait(); err != nil {
        fmt.Fprintf(os.Stderr, "Laravel server exited with error: %v\n", err)
    }
    if frontendCmd.Process != nil {
        if err := frontendCmd.Wait(); err != nil {
            fmt.Fprintf(os.Stderr, "Frontend server exited with error: %v\n", err)
        }
    }
}
