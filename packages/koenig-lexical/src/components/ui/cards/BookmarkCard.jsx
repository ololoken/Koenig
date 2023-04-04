import PropTypes from 'prop-types';
import React from 'react';
import {CardCaptionEditor} from '../CardCaptionEditor';

export function BookmarkCard({
    handleUrlChange,
    handleUrlInput,
    url, 
    urlInputValue,
    urlPlaceholder,
    thumbnail,
    title,
    description,
    icon,
    publisher,
    caption, 
    setCaption, 
    isSelected
}) {
    if (url) {
        return (
            <>
                <div className="flex min-h-[120px] w-full rounded border border-grey/40 bg-transparent font-sans dark:border-grey/20">
                    <div className="flex grow basis-full flex-col items-start justify-start p-5">
                        <div className="text-[1.5rem] font-semibold leading-normal tracking-normal text-grey-900 dark:text-grey-100">{title}</div>
                        <div className="mt-1 max-h-[44px] overflow-y-hidden text-sm font-normal leading-normal text-grey-800 line-clamp-2 dark:text-grey-600">{description}</div>
                        <div className="mt-[20px] flex items-center text-sm font-medium leading-9 text-grey-900">
                            {icon && <BookmarkIcon src={icon} />}
                            <span className=" db max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap leading-6 text-grey-900 dark:text-grey-100">{publisher}</span>
                            <span className="font-normal text-grey-800 before:mx-1.5 before:text-grey-900 before:content-['•'] dark:text-grey-600 dark:before:text-grey-100">Author McAuthory</span>
                        </div>
                    </div>
                    {thumbnail &&   
                        (<div className={'grow-1 relative m-0 min-w-[33%]'}>
                            <img alt="" className="absolute inset-0 h-full w-full rounded-r-[.3rem] object-cover" src={thumbnail}/>
                        </div>)
                    }
                </div>
                <CardCaptionEditor
                    caption={caption || ''}
                    captionPlaceholder="Type caption for bookmark (optional)"
                    isSelected={isSelected}
                    setCaption={setCaption}
                />  
            </>
        );
    }
    return (
        <input className="w-full rounded border border-grey/60 p-2 font-sans text-sm font-normal text-grey-900 dark:border-grey-800 dark:bg-grey-900 dark:text-grey-300 dark:placeholder:text-grey-800" placeholder={urlPlaceholder} value={urlInputValue} onBlur={handleUrlInput} onChange={handleUrlChange} />
    );
}

export function BookmarkIcon({src}) {
    return (
        <img alt="" className="mr-2 h-5 w-5 shrink-0" src={src}/>
    );
}

BookmarkCard.propTypes = {
    handleUrlChange: PropTypes.func,
    handleUrlInput: PropTypes.func,
    url: PropTypes.string,
    urlInputValue: PropTypes.string,
    urlPlaceholder: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
    publisher: PropTypes.string,
    thumbnail: PropTypes.string
};