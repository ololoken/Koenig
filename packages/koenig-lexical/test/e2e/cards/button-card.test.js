import {assertHTML, createSnippet, focusEditor, html, initialize, insertCard, test} from '../../utils/e2e';
import {expect} from '@playwright/test';

test.describe('Button Card', async () => {
    let page;

    test.beforeAll(async ({sharedPage}) => {
        page = sharedPage;
    });

    test.beforeEach(async () => {
        await initialize({page});
    });

    test('can import serialized button card nodes', async function () {
        await page.evaluate(() => {
            const serializedState = JSON.stringify({
                root: {
                    children: [{
                        type: 'button',
                        buttonUrl: 'http://someblog.com/somepost',
                        buttonText: 'button text',
                        alignment: 'center'
                    }],
                    direction: null,
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            });
            const editor = window.lexicalEditor;
            const editorState = editor.parseEditorState(serializedState);
            editor.setEditorState(editorState);
        });

        await assertHTML(page, html`
        <div data-lexical-decorator="true" contenteditable="false">
            <div data-kg-card-editing="false" data-kg-card-selected="false" data-kg-card="button">
            </div>
        </div>
        `, {ignoreCardContents: true});
    });

    test('renders button card', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        await assertHTML(page, html`
            <div data-lexical-decorator="true" contenteditable="false">
                <div data-kg-card-editing="true" data-kg-card-selected="true" data-kg-card="button">
                </div>
            </div>
            <p><br /></p>
        `, {ignoreCardContents: true});
    });

    test('has settings panel', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        await expect(await page.getByTestId('settings-panel')).toBeVisible();
        await expect(await page.getByTestId('button-align-left')).toBeVisible();
        await expect(await page.getByTestId('button-align-center')).toBeVisible();
        await expect(await page.getByTestId('button-input-text')).toBeVisible();
        await expect(await page.getByTestId('button-input-url')).toBeVisible();
    });

    test('alignment buttons work', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        // align center by default
        const buttonCard = await page.getByTestId('button-card');
        await expect(buttonCard).toHaveClass(/justify-center/);

        const leftAlignButton = await page.getByTestId('button-align-left');
        leftAlignButton.click();
        await expect(buttonCard).toHaveClass(/justify-start/);

        const centerAlignButton = await page.getByTestId('button-align-center');
        centerAlignButton.click();
        await expect(buttonCard).toHaveClass(/justify-center/);
    });

    test('default settings are appropriate', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        await expect(await page.getByTestId('button-card-btn-span').textContent()).toEqual('Add button text');
        const buttonTextInput = await page.getByTestId('button-input-text');
        await expect(buttonTextInput).toHaveAttribute('placeholder','Add button text');
        const buttonUrlInput = await page.getByTestId('button-input-url');
        await expect(buttonUrlInput).toHaveAttribute('placeholder','https://yoursite.com/#/portal/signup/');
    });

    test('text input field works', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        // verify default values
        await expect(await page.getByTestId('button-card-btn-span').textContent()).toEqual('Add button text');

        const buttonTextInput = await page.getByTestId('button-input-text');
        await expect(buttonTextInput).toHaveValue('');

        await page.getByTestId('button-input-text').fill('test');
        await expect(buttonTextInput).toHaveValue('test');
        await expect(await page.getByTestId('button-card-btn-span').textContent()).toEqual('test');
    });

    test('url input field works', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        const buttonTextInput = await page.getByTestId('button-input-url');
        await expect(buttonTextInput).toHaveValue('');

        await page.getByTestId('button-input-url').fill('https://someblog.com/somepost');
        await expect(buttonTextInput).toHaveValue('https://someblog.com/somepost');
        const buttonLink = await page.getByTestId('button-card-btn');
        await expect(buttonLink).toHaveAttribute('href','https://someblog.com/somepost');
    });

    // NOTE: an improvement would be to pass in suggested url options, but the construction now doesn't make that straightforward
    test('suggested urls display', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        const buttonTextInput = await page.getByTestId('button-input-url');
        await expect(buttonTextInput).toHaveValue('');

        await page.getByTestId('button-input-url').fill('Home');
        await page.waitForSelector('[data-testid="button-input-url-listOption"]');
        await expect(await page.getByTestId('button-input-url-listOption-Homepage')).toHaveText('Homepage');
        await page.getByTestId('button-input-url-listOption').click();

        // need to make this any string value because we don't want to hardcode the window.location value
        const anyString = new RegExp(`.*`);
        await expect(buttonTextInput).toHaveValue(anyString);
        const buttonLink = await page.getByTestId('button-card-btn');
        await expect(buttonLink).toHaveAttribute('href',anyString);
    });

    test('can add snippet', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'button'});

        await page.getByTestId('button-input-text').fill('test');

        // create snippet
        await page.keyboard.press('Escape');
        await createSnippet(page);

        // can insert card from snippet
        await page.keyboard.press('Enter');
        await page.keyboard.type('/snippet');
        await page.waitForSelector('[data-kg-cardmenu-selected="true"]');
        await page.keyboard.press('Enter');
        await expect(await page.locator('[data-kg-card="button"]')).toHaveCount(2);
    });
});
