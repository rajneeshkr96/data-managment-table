import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { OverlayPanel } from 'primereact/overlaypanel';
interface Data {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

interface CustomSelection {
    select: boolean;
    start: number;
    end: number;
    limit: number;
    notSelected: number[];
}

const Table = () => {
    const [data, setData] = useState<Data[]>([]);
    const [selectedData, setSelectedData] = useState<Data[]>([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(12);
    const [totalRecords, setTotalRecords] = useState(0);
    const [customRow, setCustomRow] = useState(0);
    const [loading, setLoading] = useState(false);
    const [customSelect, setCustomSelect] = useState<CustomSelection>({ select: false, start: 0, end: 12, limit: 12, notSelected: [] });
    const op = useRef<OverlayPanel>(null);

    const selectedItem = (data: Data[]) => {
        return data.filter(item => !customSelect.notSelected.includes(item.id));
    };
    

    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                const page = Math.floor(first/rows) +1
                const res = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
                const data: Data[] = res.data.data;
                setData(res.data.data);
                setRows(res.data.pagination.limit);
                setTotalRecords(res.data.pagination.total);
                if (customSelect.select  && customSelect.start<= Math.floor(first/rows) && customSelect.end > Math.floor(first/rows)) {
                    console.log(Math.floor(first/rows) , customSelect.end,"value..")
                    if(Math.floor(first/rows)+1 === customSelect.end ){
                        const val = selectedItem(data.filter((_, index) => index < customSelect.limit));
                        setSelectedData(val)
                        
                    }else{
                        setSelectedData(selectedItem(data))
                    }
                    
                }

                setLoading(false)
            } catch (error) {
                setLoading(false)
                console.error(error);
            }
        };
        getData();
    }, [first]);

    // Update the selection based on selected ids and page

    const handleSelectionChange = (e:any) => {
        const value: Data[] = e.value;
        const newSelectedIds = value.map(item => item.id);
        setSelectedData(value);
        
        if (customSelect.select) {
            const notSelected = selectedData
                .filter(item => !newSelectedIds.includes(item.id))
                .map(item => item.id);
            setCustomSelect({ ...customSelect, notSelected:[...customSelect.notSelected,...notSelected] });
        }
    };

    const onPageChange = (event: PaginatorPageChangeEvent) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const handleCustomSelect = (e:any) => {
        op.current?.toggle(e);
    };

    const handleSubmit = () => {
        let limit = customRow % rows
        if(limit == 0){
            limit = rows
        }
        const fir = Math.floor(first/rows)
        const end = Math.floor(Math.ceil(customRow/rows) + (first/rows))
        console.log(first,end,"llll")
        setCustomSelect({ ...customSelect, select: true, limit: limit,start:fir,end:end });
        op.current?.hide();
        if(customRow<=rows){
            setSelectedData(selectedItem(data).filter((_, index) => index < limit));
        }else{
            setSelectedData(selectedItem(data));
        }
    };

    const iconHeaderTemplate = () => {
        return (
            <div className='text-left pr-2 text-2xl'>
                <button style={{ cursor: 'pointer' }} onClick={handleCustomSelect}>^</button>
                <OverlayPanel ref={op}>
                    <div className='py-4 px-2 flex flex-col justify-center items-center gap-2'>
                        <input onChange={(e) => setCustomRow(Number(e.target.value))} className='py-2 px-1 text-center' type="number" placeholder='number of rows' />
                        <button onClick={handleSubmit} className='px-1 py-2 w-full rounded-sm bg-black text-white'>Submit</button>
                    </div>
                </OverlayPanel>
            </div>
        );
    };

    return (
        <div className='p-1 bg-gray-500 rounded-lg'>
            {loading && <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-[#2929293a] text-white z-10'>Loading...</div>}
            <DataTable
                value={data}
                selection={selectedData}
                selectionMode="multiple"
                onSelectionChange={handleSelectionChange}
                dataKey="id"
                className="p-2 "
                let-i="rowIndex"
            >
                <Column
                    bodyClassName="py-4 px-2 text-center checkbox-column"
                    bodyStyle={{ textAlign: 'center' }}
                    selectionMode="multiple"
                />
                <Column
                    header={iconHeaderTemplate}
                    headerStyle={{ textAlign: 'center' }}
                    bodyClassName="text-center"
                />
                <Column field="id" header="ID" headerStyle={{ textAlign: 'center' }} bodyClassName="px-3" />
                <Column field="title" header="Title" headerStyle={{ textAlign: 'center' }} bodyClassName="px-3" />
                <Column field="place_of_origin" header="Place of Origin" headerStyle={{ textAlign: 'center' }} bodyClassName="px-3" />
                <Column field="artist_display" header="Artist Display" headerStyle={{ textAlign: 'center' }} bodyClassName="px-3" />
                <Column field="inscriptions" header="Inscriptions" headerStyle={{ textAlign: 'center' }} bodyClassName="px-3" />
                <Column field="date_start" header="Date Start" headerStyle={{ textAlign: 'center' }} bodyClassName="px-3" />
                <Column field="date_end" header="Date End" headerStyle={{ textAlign: 'center' }} bodyClassName="px-3" />
            </DataTable>

            <Paginator className='font-bold' first={first} rows={rows} totalRecords={totalRecords} onPageChange={onPageChange} />
        </div>
    );
};

export default Table;
