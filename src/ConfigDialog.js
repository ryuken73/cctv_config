import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Column from './Column';
import AddManualUrl from './AddManualUrl';
import { DragDropContext } from 'react-beautiful-dnd';
import {moveTo, remove, add} from './lib/arrayUtil';
import axios from 'axios';

const scroll = 'paper';
const columnNames =  ['dragFrom', 'dropOn'];

const ConfigDialog = props => {
    const {
        open=false,
        cctvsNotSelected=[],
        cctvsSelected=[],
        setCCTVsSelectedAray,
        setCCTVsNotSelectedArray,
        setDialogOpen=()=>{},
        checkedCCTVId,
        setCheckedCCTVId,
        optionTitle="Select CCTVs",
        displayGrid=true,
        gridDimension=2,
        autoInterval=10,
        preload=false,
        setOptionsNSave=()=>{},
    } = props;
    
    const [changed, setChanged] = React.useState(false);
    const disableSaveBtn = !changed;

    React.useEffect(() => {
        axios.get('/extUrl/latest')
        .then(res => {
            const cctvsFromRemote = res.data;
            const cctvNotSelectedByLatest = cctvsFromRemote.reduce((acct, cctv) => {
                const isInSelected = cctvsSelected.find(selectedCCTV => selectedCCTV.cctvId === cctv.cctvId)
                if(isInSelected){
                    return [...acct]
                } else {
                    return [...acct, cctv]
                }
            },[])
            setCCTVsNotSelectedArray(cctvNotSelectedByLatest);
        })
        .catch(err => {
            alert('failed to get cctv data.')
        })
        // initialize changed status.
        setChanged(false);
    },[open])

    const checkedInSelected = checkedCCTVId && cctvsSelected.some(cctv => cctv.cctvId === checkedCCTVId);
    const allCCTVs = React.useMemo(() => {
        return [...cctvsNotSelected, ...cctvsSelected]
    },[cctvsNotSelected, cctvsSelected])

    const methods = React.useMemo(() => {
        return {
            dragFrom: setCCTVsNotSelectedArray,
            dropOn: setCCTVsSelectedAray
        }
    },[setCCTVsNotSelectedArray, setCCTVsSelectedAray])

    const columnItems = React.useMemo(() => {
        return {
            dragFrom: cctvsNotSelected,
            dropOn: cctvsSelected
        }
    },[cctvsNotSelected, cctvsSelected])

    console.log('re-render filter :', columnItems, preload)

    const onClickSaveBtn = React.useCallback(() => {
        axios.put('/extUrl/save', allCCTVs)
        .then((res) => {
            setChanged(false)
        })
        .catch((err) => {
            alert('failed to save cctv data. try again.')
        })

    },[allCCTVs])

    const onCloseFilterDialog = () => {
        setDialogOpen(false);
    }

    const onDragEnd = React.useCallback(result => {
        const {destination, source} = result;
        const MOVE_OUTSIDE = !destination;
        const NOT_MOVED = !MOVE_OUTSIDE && destination.droppableId === source.droppableId && destination.index === source.index;
        if(MOVE_OUTSIDE || NOT_MOVED) return;

        const sourceIndex = source.index;
        const targetIndex = destination.index;

        const sourceArray = columnItems[source.droppableId];
        const targetArray = columnItems[destination.droppableId];

        const setSourceMethod = methods[source.droppableId];
        const setTargetMethod = methods[destination.droppableId];

        const DROP_IN_SAME_COLUMN = source.droppableId ===  destination.droppableId;
        if(DROP_IN_SAME_COLUMN){
            // exchange cctvIds;
            const newArray = moveTo(targetArray).fromIndex(sourceIndex).toIndex(targetIndex);
            setSourceMethod([...newArray]);
        }

        const DROP_IN_OTHER_COLUMN = source.droppableId !==  destination.droppableId;
        if(DROP_IN_OTHER_COLUMN){
            const sourceCCTV = sourceArray[sourceIndex];
            const newSourceArray = remove(sourceArray).fromIndex(sourceIndex);
            const newTargetArray = add(targetArray).toIndex(targetIndex).value(sourceCCTV);
            setSourceMethod([...newSourceArray]);
            setTargetMethod([...newTargetArray]);
        }
    },[columnItems, methods])

    const moveAllCCTVs = React.useCallback((fromColumnName) => {
        // not works.
        // if(fromColumnName === 'dragFrom'){
        //     setCCTVsNotSelectedArray([]);
        //     setCCTVsSelectedAray(selected => {
        //         return [...selected, cctvsNotSelected];
        //     });
        // } 
        // if(fromColumnName === 'dragOn'){
        //     setCCTVsSelectedAray([]);
        //     setCCTVsNotSelectedArray(notSelected => {
        //         return [...notSelected, cctvsSelected];
        //     });
        // } 
    },[cctvsNotSelected, cctvsSelected, setCCTVsNotSelectedArray, setCCTVsSelectedAray])

    const handleChangeGridDimension = React.useCallback(event => {
        setOptionsNSave('gridDimension', event.target.value)
    },[setOptionsNSave])

    const handleChangeAutoInterval = React.useCallback(event => {
        setOptionsNSave('autoInterval', event.target.value)
    },[setOptionsNSave])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Dialog
                open={open}
                onClose={onCloseFilterDialog}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle id="scroll-dialog-title">
                    <Box display="flex" flexDirection="row">
                        {optionTitle}
                        <Box style={{marginLeft:'auto'}}>
                        </Box>
                        {displayGrid && 
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={gridDimension}
                                onChange={handleChangeGridDimension}
                                row
                            >
                                <FormControlLabel value="2" control={<Radio size="small" />} label="2X2" />
                                <FormControlLabel value="3" control={<Radio size="small"/>} label="3X3" />
                            </RadioGroup>
                        }
                        {displayGrid &&
                            <input type="text" onChange={handleChangeAutoInterval} value={autoInterval}>
                            </input>
                        }
                    </Box>
                </DialogTitle>
                {/* <DialogContent dividers={scroll === 'paper'}> */}
                    <DialogContentText
                        id="scroll-dialog-description"
                        tabIndex={-1}
                    >
                        <Box display="flex" justifyContent="space-around">
                            {columnNames.map(columnName => (
                                <Column
                                    // title={columnData[columnName].title}
                                    // column={columnData[columnName]}
                                    // columnData={columnData}
                                    // cctvs={cctvs}
                                    // setColumnData={setColumnData}
                                    columnName={columnName}
                                    columnItems={columnItems[columnName]}
                                    moveAllCCTVs={moveAllCCTVs}
                                    checkedCCTVId={checkedCCTVId}
                                    setCheckedCCTVId={setCheckedCCTVId}
                                    setCCTVs={methods[columnName]}
                                    setChanged={setChanged}
                                >
                                </Column>
                            ))}
                        </Box>
                    </DialogContentText>
                {/* </DialogContent> */}
                <AddManualUrl
                    allCCTVs={allCCTVs}
                    checkedCCTVId={checkedCCTVId}
                    checkedInSelected={checkedInSelected}
                    setCCTVsSelectedArray={setCCTVsSelectedAray}
                    setCCTVsNotSelectedArray={setCCTVsNotSelectedArray} 
                    setChanged={setChanged}
                ></AddManualUrl>
                <Button
                    variant="contained" 
                    size="small"
                    disabled={disableSaveBtn}
                    sx={{
                        marginLeft: '20px',
                        marginRight: '20px',
                        marginBottom: '10px'
                    }}
                    onClick={onClickSaveBtn}
                >
                    Save Change
                </Button>
            </Dialog>
        </DragDropContext>
    )
}

export default React.memo(ConfigDialog)