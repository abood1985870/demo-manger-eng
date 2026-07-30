using System;
using System.Diagnostics;
using System.IO;

class Program
{
    static void Main()
    {
        try
        {
            string targetUrl = "https://demo-manger-eng.vercel.app";
            try {
                Process.Start("msedge.exe", "--app=" + targetUrl);
            } catch {
                try {
                    Process.Start("chrome.exe", "--app=" + targetUrl);
                } catch {
                    Process.Start(new ProcessStartInfo(targetUrl) { UseShellExecute = true });
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
