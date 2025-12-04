using System.Text.RegularExpressions;

namespace MyNote.Application.Common.Services;

public record CheckboxInfo
{
    public string Id { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public bool IsChecked { get; init; }
    public string? DueDate { get; init; }
}

public static partial class CheckboxParser
{
    // Pattern matches Tiptap TaskList HTML format:
    // <li class="task-item" data-checked="false" data-task-id="uuid" data-type="taskItem">
    //   <label><input type="checkbox"><span></span></label>
    //   <div><p>Task text</p></div>
    // </li>

    [GeneratedRegex(@"<li[^>]*data-type=""taskItem""[^>]*>", RegexOptions.IgnoreCase)]
    private static partial Regex TaskItemOpenTagRegex();

    [GeneratedRegex(@"data-checked=""(true|false)""", RegexOptions.IgnoreCase)]
    private static partial Regex DataCheckedRegex();

    [GeneratedRegex(@"data-task-id=""([^""]+)""")]
    private static partial Regex TaskIdRegex();

    [GeneratedRegex(@"data-due-date=""([^""]+)""")]
    private static partial Regex DueDateRegex();

    // Match simple format: <li ...>text</li>
    [GeneratedRegex(@"<li[^>]*data-type=""taskItem""[^>]*>([^<]*)</li>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex TaskItemWithSimpleTextRegex();

    // Match Tiptap format with nested elements: <li ...>...<p>text</p>...</li>
    [GeneratedRegex(@"<li[^>]*data-type=""taskItem""[^>]*>.*?<p>([^<]*)</p>.*?</li>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex TaskItemWithNestedTextRegex();

    // Match full li element to extract attributes
    [GeneratedRegex(@"<li[^>]*data-type=""taskItem""[^>]*>.*?</li>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex TaskItemFullRegex();

    public static List<CheckboxInfo> ParseCheckboxes(string htmlContent)
    {
        var checkboxes = new List<CheckboxInfo>();

        if (string.IsNullOrEmpty(htmlContent))
            return checkboxes;

        // Match all task items
        var fullMatches = TaskItemFullRegex().Matches(htmlContent);

        foreach (Match fullMatch in fullMatches)
        {
            var liElement = fullMatch.Value;

            // Try to extract text - first try nested <p> format (Tiptap)
            var nestedMatch = TaskItemWithNestedTextRegex().Match(liElement);
            string text;
            if (nestedMatch.Success)
            {
                text = nestedMatch.Groups[1].Value.Trim();
            }
            else
            {
                // Fall back to simple format
                var simpleMatch = TaskItemWithSimpleTextRegex().Match(liElement);
                text = simpleMatch.Success ? simpleMatch.Groups[1].Value.Trim() : string.Empty;
            }

            // Skip empty checkboxes
            if (string.IsNullOrWhiteSpace(text))
                continue;

            // Extract data-checked
            var checkedMatch = DataCheckedRegex().Match(liElement);
            var isChecked = checkedMatch.Success && checkedMatch.Groups[1].Value.Equals("true", StringComparison.OrdinalIgnoreCase);

            // Extract data-task-id
            var taskIdMatch = TaskIdRegex().Match(liElement);
            var taskId = taskIdMatch.Success ? taskIdMatch.Groups[1].Value : string.Empty;

            // Extract data-due-date
            var dueDateMatch = DueDateRegex().Match(liElement);
            var dueDate = dueDateMatch.Success ? dueDateMatch.Groups[1].Value : null;

            checkboxes.Add(new CheckboxInfo
            {
                Id = taskId,
                Text = text,
                IsChecked = isChecked,
                DueDate = dueDate
            });
        }

        return checkboxes;
    }

    public static string UpdateCheckboxTaskId(string htmlContent, string oldPattern, string newTaskId)
    {
        if (string.IsNullOrEmpty(htmlContent))
            return htmlContent;

        // Add data-task-id to a taskItem that doesn't have one
        // This matches a li with data-type="taskItem" but no data-task-id
        return htmlContent.Replace(oldPattern, $"{oldPattern.TrimEnd('>')} data-task-id=\"{newTaskId}\">");
    }

    public static string SetCheckboxTaskId(string htmlContent, string text, string taskId, bool isChecked)
    {
        if (string.IsNullOrEmpty(htmlContent))
            return htmlContent;

        var checkedAttr = isChecked ? "true" : "false";

        // Find the checkbox by its text and add/update the task-id
        var pattern = $@"(<li[^>]*data-type=""taskItem""[^>]*data-checked=""{checkedAttr}""[^>]*)>({Regex.Escape(text)})</li>";
        var replacement = $@"$1 data-task-id=""{taskId}"">$2</li>";

        return Regex.Replace(htmlContent, pattern, replacement, RegexOptions.IgnoreCase);
    }

    public static string UpdateCheckboxCheckedState(string htmlContent, string taskId, bool isChecked)
    {
        if (string.IsNullOrEmpty(htmlContent) || string.IsNullOrEmpty(taskId))
            return htmlContent;

        var newCheckedValue = isChecked ? "true" : "false";
        var oldCheckedValue = isChecked ? "false" : "true";

        // Find checkbox by task-id and update its checked state
        var pattern = $@"(<li[^>]*data-type=""taskItem""[^>]*)data-checked=""{oldCheckedValue}""([^>]*data-task-id=""{Regex.Escape(taskId)}""[^>]*)>";
        var replacement = $@"$1data-checked=""{newCheckedValue}""$2>";

        var result = Regex.Replace(htmlContent, pattern, replacement, RegexOptions.IgnoreCase);

        // Also try the other order (task-id before checked)
        pattern = $@"(<li[^>]*data-type=""taskItem""[^>]*data-task-id=""{Regex.Escape(taskId)}""[^>]*)data-checked=""{oldCheckedValue}""([^>]*)>";
        replacement = $@"$1data-checked=""{newCheckedValue}""$2>";

        return Regex.Replace(result, pattern, replacement, RegexOptions.IgnoreCase);
    }

    public static string UpdateCheckboxDueDate(string htmlContent, string taskId, string? dueDate)
    {
        if (string.IsNullOrEmpty(htmlContent) || string.IsNullOrEmpty(taskId))
            return htmlContent;

        // First, remove any existing due date attribute for this task
        var removePattern = $@"(<li[^>]*data-task-id=""{Regex.Escape(taskId)}""[^>]*)\s*data-due-date=""[^""]*""";
        var result = Regex.Replace(htmlContent, removePattern, "$1", RegexOptions.IgnoreCase);

        // Also try the other order
        removePattern = $@"data-due-date=""[^""]*""\s*([^>]*data-task-id=""{Regex.Escape(taskId)}"")";
        result = Regex.Replace(result, removePattern, "$1", RegexOptions.IgnoreCase);

        // If no due date, just return without it
        if (string.IsNullOrEmpty(dueDate))
            return result;

        // Add the new due date before the closing >
        var addPattern = $@"(<li[^>]*data-task-id=""{Regex.Escape(taskId)}""[^>]*)>";
        var replacement = $@"$1 data-due-date=""{dueDate}"">";
        result = Regex.Replace(result, addPattern, replacement, RegexOptions.IgnoreCase);

        return result;
    }

    public static string UpdateCheckboxText(string htmlContent, string taskId, string newText)
    {
        if (string.IsNullOrEmpty(htmlContent) || string.IsNullOrEmpty(taskId))
            return htmlContent;

        // Try Tiptap nested format first: <li ...data-task-id="taskId"...>...<p>old text</p>...</li>
        var nestedPattern = $@"(<li[^>]*data-task-id=""{Regex.Escape(taskId)}""[^>]*>.*?<p>)[^<]*(</p>.*?</li>)";
        var nestedReplacement = $@"$1{newText}$2";
        var result = Regex.Replace(htmlContent, nestedPattern, nestedReplacement, RegexOptions.IgnoreCase | RegexOptions.Singleline);

        // If nested pattern didn't match (content unchanged), try simple format
        if (result == htmlContent)
        {
            var simplePattern = $@"(<li[^>]*data-task-id=""{Regex.Escape(taskId)}""[^>]*>)[^<]*(</li>)";
            var simpleReplacement = $@"$1{newText}$2";
            result = Regex.Replace(htmlContent, simplePattern, simpleReplacement, RegexOptions.IgnoreCase);
        }

        return result;
    }
}
