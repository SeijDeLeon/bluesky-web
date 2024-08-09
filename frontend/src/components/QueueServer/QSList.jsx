import { useEffect, useRef } from 'react';
import QItem from './QItem';
import dayjs from 'dayjs';
import '../../App.css';

export default function QSList({ queueData=[], handleQItemClick=()=>{}, type='default' }) {

    const listRef = useRef(null);

    useEffect(() => {
        const scrollToTop = () => {
            if (listRef.current) {
                listRef.current.scrollTop = -listRef.current.scrollHeight; // Scroll to the top
            }
        };

        // Using setTimeout to ensure the DOM has fully rendered
        const timeoutId = setTimeout(scrollToTop, 0);

        return () => clearTimeout(timeoutId);
    }, [queueData]);

    if (type === 'default') {
        return (
            <section className="">
                <h2 className="text-white text-xl text-center">Queue Items</h2>
                <ul className="flex flex-row-reverse mt-2 justify-evenly overflow-auto scrollbar-always-visible">
                    {queueData.map((item, index) => <QItem type="default" item={item} label={index} key={item.item_uid} handleClick={()=>handleQItemClick(item, true)}/>)}
                    {queueData.length < 6 ? [...new Array(6 - queueData.length)].map((item, index) => <QItem item={item} index={index} key={index}/>) : '' }
                </ul>
            </section>
        );
    } else if (type === 'history') {
        const showDeleteButton = false;
        return (
            <section className="h-full w-full flex flex-col ">
                <h2 className="h-[10%] text-white text-xl text-center flex items-end justify-center ">History</h2>
                <ul ref={listRef} className="flex flex-col-reverse space-y-12 h-[90%] scrollbar-always-visible scrollbar-track-black overflow-auto ">
                    {queueData.map((item, index) => <QItem type="history" item={item} label={dayjs(item.result.time_stop * 1000).format('MM/DD hh:mm a')} key={item.item_uid} handleClick={()=>handleQItemClick(item, showDeleteButton)}/>)}
                </ul>
            </section>
        )
    };
}