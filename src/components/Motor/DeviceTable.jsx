import { useState, useEffect, useRef } from 'react';
import Button from '../library/Button';
import dayjs from 'dayjs';

export default function DeviceTable( { connection, devices, setDevices, activeDisplay }) { 

    const sampleDevices = {
        'IOC:m1' : {
            id: 1,
            prefix: 'IOC:m1',
            nickname: '',
            group: 'sim',
            isConnected: true,
            value: 5,
            units: 'mm'
        } ,
        'IOC:m2' : {
            id: 2,
            prefix: 'IOC:m2',
            nickname: '',
            group: 'sim',
            isConnected: true,
            value: 5,
            units: 'mm'
        } ,
        'IOC:bad' : {
            id: 3,
            prefix: 'IOC:m1',
            nickname: '',
            group: 'sim',
            isConnected: false,
            value: null,
            units: 'mm'
        } ,
        'IOC:real' : {
            id: 4,
            prefix: 'IOC:m1',
            nickname: '',
            group: 'physical',
            isConnected: true,
            value: 5,
            units: 'mm'
        }
    }

    const [lockoutList, setLockoutList] = useState([]);


    const setDeviceValue = (device, currentValue, newValue) => {
        console.log('setDeviceValue()');
        console.log({devices});
        console.log('current value = ', currentValue);
        console.log('newValue = ', newValue);
        if (isValueInBounds(newValue, device.min, device.max, device.prefix)) {
            if (isDeviceUnlocked(device, lockoutList)) {
                setLockoutList([...lockoutList, device.prefix]);
                try {
                    connection.current.send(JSON.stringify({type: "write", pv: device.prefix, value: newValue}));
                } catch (e) {
                    console.log('Error when attempting to send message to WS in handleIncrementClick with ' + device.prefix);
                    console.log({e});
                    return;
                }
            }
        }
    }


    const unlockDevice = (prefix) => {
        //removes the first instance of the device name from the lockoutlist
        let index = lockoutList.indexOf(prefix);
        if (index !== -1) {
            let tempList = lockoutList.toSpliced(index, 1);
            setLockoutList(tempList);
        } 
    }

    const isValueInBounds = (value, min, max, prefix) => {
        if (value < min) console.log('requested value ', value, 'is below the minimum ', min, ' for ', prefix);
        if (value > max) console.log('requested value ', value, 'is greater than the maximum ', max, ' for ', prefix);
        return (value >= min && value <= max);
    }

    const isDeviceUnlocked = (device, lockoutList) => {
        if (lockoutList.includes(device.prefix)) {
            console.log('Cannot set value of ' + device.prefix + ' due to lockout');
            return false;
        } else {
            return true;
        }
    }

    //automatically try to remove the most recent addition to the lockoutList when lockoutList changes
    //useEffect will occur more times than necessary, but guarantees the device will be unlocked
    useEffect(() => {
        if (lockoutList.length !== 0) {
            setTimeout(() => unlockDevice(lockoutList.slice(-1)[0]), 250);
        }
    }, [lockoutList]);



    //to-do: set up WS listener on table load that calls unlockDevice(event.data.pv)




    if (activeDisplay === 'DeviceTable') {
        return (
            <div className='my-8'>
                <ul className='h-5/6 rounded-md border border-slate-300'>
                    <li className="flex h-[10%] justify-center items-center space-x-4  text-lg font-medium text-center bg-gray-100 rounded-t-md">
                        <p className="w-2/12">Device</p> 
                        <p className="w-2/12">Position</p> 
                        <p className="w-2/12">Jog Increment</p> 
                        <p className="w-3/12">Set Position</p> 
                        <p className="w-2/12">Last Update</p>
                    </li>
                    {Object.keys(devices).map((key) => {
                        return (
                        <li key={key} className={`${lockoutList.includes(key) ? 'ponter-events-none text-slate-400 cursor-not-allowed' : 'pointer-events-auto'} flex h-[10%] justify-center items-center space-x-4 text-md py-1 border-b border-t border-slate-300 font-medium text-center bg-white rounded-t-md`}>
                            <p className="w-2/12">{devices[key].prefix}</p> 
                            <div className="w-2/12 flex justify-between">
                                <p className="hover:cursor-pointer" onClick={() => setDeviceValue(devices[key], devices[key].value, (devices[key].value - devices[key].increment))}>&larr;</p>
                                <p className="">{devices[key].value} {devices[key].units}</p> 
                                <p className="hover:cursor-pointer" onClick={() => setDeviceValue(devices[key], devices[key].value, (parseInt(devices[key].value) + parseInt(devices[key].increment)))}>&rarr;</p>
                            </div>
                            <div className="w-2/12 flex justify-center">
                                <input className="max-w-8" type="number" value={devices[key].increment} onChange={(e) => setDevices({...devices, [key]: { ...devices[key], increment: parseInt(e.target.value)}})} />
                                <p className="">{devices[key].units}</p> 
                            </div>
                            <div className="w-3/12 flex justify-center space-x-2">
                                <input type="number" value={devices[key].setValue} className="border-b border-black w-4/12 text-right" onChange={(e) => setDevices({...devices, [key]: { ...devices[key], setValue: parseInt(e.target.value)}})}/>
                                <p>{devices[key].units}</p>
                                <Button cb={() => setDeviceValue(devices[key], devices[key].value, devices[key].setValue)} text="Set" styles="px-[4px] py-[1px] text-sm ml-0"/>
                            </div>
                            <p className="w-2/12">{devices[key].lastUpdate.format('hh:mm:ss a')}</p>
                        </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
}