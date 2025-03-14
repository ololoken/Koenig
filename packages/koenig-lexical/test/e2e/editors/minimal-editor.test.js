import {assertHTML, focusEditor, html, initialize, test} from '../../utils/e2e';
import {expect} from '@playwright/test';

test.describe('Koening Editor with minimal nodes', async function () {
    let page;

    test.beforeAll(async ({sharedPage}) => {
        page = sharedPage;
    });

    test.beforeEach(async () => {
        await initialize({page, uri: '/#/minimal?content=false'});
    });

    test('can add basic text', async function () {
        await focusEditor(page);

        await page.keyboard.type('Hello World');

        await assertHTML(page, html`
            <p dir="ltr"><span data-lexical-text="true">Hello World</span></p>
        `);
    });

    test('restricts to single paragraph by typing manually', async function () {
        await focusEditor(page);

        await page.keyboard.type('Hello World');
        await page.keyboard.press('Enter');
        await page.keyboard.type('This is second para');

        await assertHTML(page, html`
            <p dir="ltr"><span data-lexical-text="true">Hello WorldThis is second para</span></p>
        `);
    });

    test('ignores hr card shortcut', async function () {
        await focusEditor(page);

        await page.keyboard.type('---');
        await page.keyboard.press('Enter');

        await assertHTML(page, html`
            <p><span data-lexical-text="true">---</span></p>
        `);
    });

    test('ignores code block card shortcut', async function () {
        await focusEditor(page);
        await page.keyboard.type('```javascript ');

        await assertHTML(page, html`
            <p dir="ltr"><span data-lexical-text="true">\`\`\`javascript </span></p>
        `);
    });

    test('ignores image card shortcut', async function () {
        await focusEditor(page);

        await page.keyboard.type('image! ');

        await assertHTML(page, html`
            <p dir="ltr"><span data-lexical-text="true">image! </span></p>
        `);
    });

    test('ignores slash menu on blank paragraph', async function () {
        await focusEditor(page);
        await expect(await page.locator('[data-kg-slash-menu]')).toHaveCount(0);
        await page.keyboard.type('/');
        await expect(await page.locator('[data-kg-slash-menu]')).toHaveCount(0);
    });

    test.describe('Floating format toolbar', async () => {
        test('appears on text selection', async function () {
            await focusEditor(page);
            await page.keyboard.type('text for selection');

            await expect(await page.locator('[data-kg-floating-toolbar]')).toHaveCount(0);

            await page.keyboard.down('Shift');
            for (let i = 0; i < 'for selection'.length; i++) {
                await page.keyboard.press('ArrowLeft');
            }
            await page.keyboard.up('Shift');

            expect(await page.locator('[data-kg-floating-toolbar]')).not.toBeNull();
        });

        test('does not has heading buttons', async function () {
            await focusEditor(page);
            await page.keyboard.type('text for selection');

            await expect(await page.locator('[data-kg-floating-toolbar]')).toHaveCount(0);

            await page.keyboard.down('Shift');
            for (let i = 0; i < 'for selection'.length; i++) {
                await page.keyboard.press('ArrowLeft');
            }
            await page.keyboard.up('Shift');

            expect(await page.locator('[data-kg-floating-toolbar]')).not.toBeNull();

            const boldButtonSelector = `[data-kg-floating-toolbar] [data-kg-toolbar-button="bold"] button`;
            expect(await page.locator(boldButtonSelector)).not.toBeNull();

            const h2ButtonSelector = `[data-kg-floating-toolbar] [data-kg-toolbar-button="h2"] button`;
            await expect(await page.locator(h2ButtonSelector)).toHaveCount(0);

            const h3ButtonSelector = `[data-kg-floating-toolbar] [data-kg-toolbar-button="h3"] button`;
            await expect(await page.locator(h3ButtonSelector)).toHaveCount(0);
        });
    });
});
