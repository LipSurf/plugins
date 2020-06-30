# Testing

[Commands](/api-reference/command.md#icommand) may define a `test` function.

In the future, the tests will likely be run periodically on a server to make sure plugins stay working for the pages that they run on.

Keep in mind that tests run in the context of node, and need to use Webdriver APIs to access the browser and page.

See [Test API reference](api-reference/test.md).




