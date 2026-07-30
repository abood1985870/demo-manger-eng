using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

internal static class RusukhLauncher
{
    private const string LocalUrl = "http://127.0.0.1:3100";
    private const string HealthUrl = LocalUrl + "/api/health";

    [STAThread]
    private static void Main()
    {
        string appDirectory = AppDomain.CurrentDomain.BaseDirectory;
        string frontendDirectory = Path.Combine(appDirectory, "frontend");
        string runner = Path.Combine(appDirectory, "Run Production.bat");

        if (!Directory.Exists(frontendDirectory) || !File.Exists(runner))
        {
            ShowError("ضع ملف التشغيل داخل مجلد cafe_app بجانب مجلد frontend وملف Run Production.bat.");
            return;
        }

        if (IsHealthy())
        {
            OpenBrowser();
            return;
        }

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = "/k \"\"" + runner + "\"\"",
                WorkingDirectory = appDirectory,
                UseShellExecute = true,
                WindowStyle = ProcessWindowStyle.Normal
            };
            Process.Start(startInfo);
        }
        catch (Exception ex)
        {
            ShowError("تعذر تشغيل رُسوخ:\n" + ex.Message);
            return;
        }

        for (int attempt = 0; attempt < 240; attempt++)
        {
            Thread.Sleep(500);
            if (IsHealthy())
            {
                OpenBrowser();
                return;
            }
        }

        ShowError(
            "بدأت نافذة التشغيل، لكن النظام لم يستجب خلال دقيقتين.\n" +
            "راجع الرسالة الظاهرة في نافذة Run Production."
        );
    }

    private static bool IsHealthy()
    {
        try
        {
            var request = (HttpWebRequest)WebRequest.Create(HealthUrl);
            request.Method = "GET";
            request.Timeout = 700;
            request.ReadWriteTimeout = 700;
            using (var response = (HttpWebResponse)request.GetResponse())
            {
                return response.StatusCode == HttpStatusCode.OK;
            }
        }
        catch
        {
            return false;
        }
    }

    private static void OpenBrowser()
    {
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = LocalUrl,
                UseShellExecute = true
            });
        }
        catch (Exception ex)
        {
            ShowError("النظام يعمل، لكن تعذر فتح المتصفح تلقائيًا:\n" + ex.Message);
        }
    }

    private static void ShowError(string message)
    {
        MessageBox.Show(
            message,
            "تشغيل رُسوخ",
            MessageBoxButtons.OK,
            MessageBoxIcon.Error,
            MessageBoxDefaultButton.Button1,
            MessageBoxOptions.RtlReading | MessageBoxOptions.RightAlign
        );
    }
}
