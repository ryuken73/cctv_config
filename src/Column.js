import React from 'react';
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import styled from 'styled-components';
import { Droppable } from 'react-beautiful-dnd';
import DragItem from './DragItem';

const Container = styled.div`
    height: 500px;
    width: 45%;
    border: 1px solid;
    overflow: auto; 
    border-radius: 3px;
    display: flex;
    flex-direction: column;
`

const Title = styled.h5`
  padding: 3px;
  margin: 3px;
`

const CCTVList = styled.div`
    padding: 8px;
    transition: background-color 0.2s ease;
    background-color: ${props => (props.isDraggingOver ? "skyblue" : "white")};
    flex-grow: 1;
`

const Column = props => {
    const {
        columnName, 
        columnItems,
        checkedCCTVId,
        setCheckedCCTVId,
        setCCTVs,
        moveAllCCTVs,
        setChanged
    } = props;
    console.log(columnName, columnItems)

    const onClickLink = React.useCallback(() => {
        moveAllCCTVs(columnName)
    },[columnName, moveAllCCTVs])

    const setCheckedCCTV = (cctvId, checked) => {
        checked && setCheckedCCTVId(cctvId);
        !checked && setCheckedCCTVId(null);
    }

    const itemColorDefault = columnName === 'dragFrom' ? 'skyblue':'darkblue';

    return (
        <Container>
            <Box
                display="flex"
                alignItems="center"
            >
                <Title>{columnName} [{columnItems.length}]</Title>
                <Box style={{marginLeft:'auto'}}>
                    <Link component="button" onClick={onClickLink}>
                        <Title>{columnName === "dragFrom" ? "Move All" : "Clear All"}</Title>
                    </Link>
                </Box>

            </Box>
            <Droppable droppableId={columnName}>
                {(provided, snapshot) => (
                    <CCTVList
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        isDraggingOver={snapshot.isDraggingOver}
                    >
                        {columnItems.map((cctv, index) => (
                            <DragItem 
                                key={cctv.cctvId} 
                                id={cctv.cctvId}
                                itemText={cctv.title}
                                index={index} 
                                colorDefault={itemColorDefault}
                                checked={cctv.cctvId === checkedCCTVId}
                                setChecked={setCheckedCCTV}
                                setCCTVs={setCCTVs}
                                setChanged={setChanged}
                            />
                        ))}
                        {provided.placeholder}
                    </CCTVList>
                )}
            </Droppable>
        </Container>
    )
}

export default React.memo(Column)