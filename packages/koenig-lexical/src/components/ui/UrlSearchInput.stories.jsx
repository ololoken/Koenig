import React from 'react';

import {UrlSearchInput} from './UrlSearchInput';

const story = {
    title: 'Generic/Searchable URL Input',
    component: UrlSearchInput,
    parameters: {
        status: {
            type: 'uiReady'
        }
    }
};
export default story;

const Template = args => (
    <div className="w-[740px]">
        <div className="p-4">
            <UrlSearchInput {...args} />
        </div>
        <div className="dark bg-black p-4">
            <UrlSearchInput {...args} />
        </div>
    </div>
);

export const Empty = Template.bind({});
Empty.args = {
    value: '',
    onChange: () => {}
};

export const Loading = Template.bind({});
Loading.args = {
    value: 'https://ghost.org/',
    onChange: () => {},
    isLoading: true
};

export const Placeholder = Template.bind({});
Placeholder.args = {
    value: '',
    onChange: () => {},
    placeholder: 'Enter a URL to add content...'
};

export const Populated = Template.bind({});
Populated.args = {
    value: 'https://sampleurl.com',
    onChange: () => {}
};

export const Error = Template.bind({});
Error.args = {
    value: 'thisisntaurl',
    hasError: true,
    onChange: () => {},
    handleRetry: () => {},
    handlePasteAsLink: () => {}
};
