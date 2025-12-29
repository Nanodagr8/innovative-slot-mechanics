# Rust/Cargo Installation Guide for Windows

## Prerequisites

- Windows 10 or later
- Administrator access
- Internet connection

## Step 1: Download Rustup Installer

1. Visit: **https://www.rust-lang.org/tools/install**
2. The website will detect your system (64-bit/32-bit/ARM)
3. Click **"Download rustup-init.exe"**
4. Save the file to your Downloads folder

## Step 2: Install Visual Studio C++ Build Tools

Rust requires a C++ compiler and linker on Windows.

### Option A: Install via Rustup (Recommended)

1. Run `rustup-init.exe`
2. When prompted about Visual Studio C++ tools, follow the link
3. Install **"Desktop development with C++"** workload
4. Complete the Visual Studio installation
5. Return to the Rust installer

### Option B: Manual Installation

1. Download Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
2. Select **"Build Tools for Visual Studio 2022"**
3. In the installer, check **"Desktop development with C++"**
4. Install

## Step 3: Run Rust Installation

1. Double-click `rustup-init.exe`
2. A command prompt window will appear
3. You'll see installation options:
   ```
   1) Proceed with installation (default)
   2) Customize installation
   3) Cancel installation
   ```
4. **Press `1` and Enter** for default installation
5. Wait for installation to complete (may take a few minutes)

## Step 4: Verify Installation

1. **Close and reopen** PowerShell/Command Prompt (important!)
2. Run verification commands:

```powershell
rustc --version
# Expected output: rustc 1.x.x (hash date)

cargo --version
# Expected output: cargo 1.x.x (hash date)

rustup --version
# Expected output: rustup 1.x.x (hash date)
```

If all three commands return version numbers, installation succeeded! ✅

## Step 5: Test with Math SDK Optimization

Navigate to your math-sdk directory and test:

```powershell
cd c:\Users\Kevin Inthavong\NANOSTUDIOS\math-sdk
cd optimization_program
cargo build --release
```

Expected output:

```
   Compiling ...
   Finished release [optimized] target(s) in X.XXs
```

## Troubleshooting

### "cargo: command not found"

- Close and reopen your terminal
- Verify PATH includes: `C:\Users\{YourName}\.cargo\bin`

### "linker 'link.exe' not found"

- Visual Studio C++ Build Tools not installed correctly
- Reinstall with "Desktop development with C++" workload

### Build errors in optimization_program

- Ensure you're in the `optimization_program` directory
- Try: `cargo clean` then `cargo build --release`

## Next Steps

After successful installation:

1. **Update Rust** (recommended):

   ```powershell
   rustup update
   ```

2. **View local documentation**:

   ```powershell
   rustup doc
   ```

3. **Run optimization** in math-sdk games (see SDK guide)

## Useful Commands

```powershell
# Update Rust toolchain
rustup update

# Switch to nightly version (if needed)
rustup default nightly

# View installed toolchains
rustup show

# Uninstall Rust (if needed)
rustup self uninstall
```

## Resources

- Official Rust Book: https://doc.rust-lang.org/book/
- Cargo Book: https://doc.rust-lang.org/cargo/
- Rust by Example: https://doc.rust-lang.org/rust-by-example/
