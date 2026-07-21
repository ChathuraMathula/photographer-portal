$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$source = "c:\My files\BIT - UOC (2025, 2026)\Source\photographer-portal\Dissertation_Photographer_Portal_Final_V6.docx"
$target = "c:\My files\BIT - UOC (2025, 2026)\Source\photographer-portal\Dissertation_Photographer_Portal_Final_V8.docx"

Copy-Item -Path $source -Destination $target -Force

$doc = $word.Documents.Open($target)
$selection = $word.Selection
$selection.EndKey(6) | Out-Null # wdStory = 6 (end of doc)
$selection.InsertBreak(7) | Out-Null # wdPageBreak = 7

$appB = Get-Content "C:\Users\chath\.gemini\antigravity-ide\brain\7d15183b-df02-416f-b65b-71f5f8d6d255\appendix_b_user_manual_v2.md" -Raw
$appC = Get-Content "C:\Users\chath\.gemini\antigravity-ide\brain\f5eaec2e-43bb-4d62-bda4-f66910cf57cc\appendix_c_management_reports.md" -Raw

$selection.TypeText($appB)
$selection.InsertBreak(7) | Out-Null
$selection.TypeText($appC)

$doc.Save()
$doc.Close()
$word.Quit()
