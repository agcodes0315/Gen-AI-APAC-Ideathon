MirrorTrace Black50 PowerShell Fix
==================================

The previous PowerShell file was corrupted by an encoding issue.
This replacement script is ASCII-only, so PowerShell on Windows will parse it correctly.

From the MirrorTrace project root run:

powershell -ExecutionPolicy Bypass -File .\scripts\apply-black50-to-index.ps1

Then:

npm run dev

Finally hard refresh Chrome:

Ctrl + Shift + R
