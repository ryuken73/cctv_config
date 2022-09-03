import './App.css';
import React from 'react';
import GridVideos from './GridVideos';
import ModalBox from './ModalBox';
import HLSPlayer from './HLSPlayer';
import ConfigDialog from './ConfigDialog';
import Box from '@mui/material/Box';
import { useHotkeys } from 'react-hotkeys-hook';
import useLocalStorage from './hooks/useLocalStorage';
import useAutoPlay from './hooks/useAutoPlay';

const mirrorModalPlayer = (playerNode, modalPlayer) => {
  const videoElement =  playerNode.querySelector('video');
  console.log('### videoElement:', videoElement, modalPlayer);
  const mediaStream = videoElement.captureStream();
  const modalVideoPlayer = modalPlayer.tech().el();
  modalVideoPlayer.srcObject = null;
  modalVideoPlayer.srcObject = mediaStream;
}

const KEY_OPTIONS = 'hlsCCTVOptions';
const KEY_SELECT_SAVED = 'selectedSavedCCTVs';
const KEY_NOT_SELECT_SAVED = 'notSelectedSavedCCTVs';

const getRealIndex = (gridNum, gridDimension, realSelectedArray) => {
  const totalGridNum = gridDimension * gridDimension;
  const safeMaxIndex = Math.min(totalGridNum, realSelectedArray.length);
  return gridNum % safeMaxIndex
}

function App() {
  const [savedOptions, saveOptions] = useLocalStorage(KEY_OPTIONS,{});
  const [selectedSaved, saveSelectedCCTVs] = useLocalStorage(KEY_SELECT_SAVED,[]);
  const [notSelectedSaved, saveNotSelectedCCTVs] = useLocalStorage(KEY_NOT_SELECT_SAVED,[]);
  const INITIAL_GRID_DIMENSION = savedOptions.gridDimension === undefined ? 2 : savedOptions.gridDimension;
  const INITIAL_AUTO_INTERVAL = savedOptions.autoInterval === undefined ? 10 : savedOptions.autoInterval;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalPlayer, setModalPlayer] = React.useState(null);
  const [gridDimension, setGridDimension] = React.useState(INITIAL_GRID_DIMENSION);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [autoInterval, setAutoInterval] = React.useState(INITIAL_AUTO_INTERVAL);
  const [cctvsNotSelectedArray, setCCTVsNotSelectedArray] = React.useState(notSelectedSaved);
  const [cctvsSelectedArray, setCCTVsSelectedAray] = React.useState(selectedSaved);
  const [enableOverlayModal, setEnableOverlayModal] = React.useState(false);
  const [overlayContentModal, setOverContentlayModal] = React.useState('');
  const [enableOverlayGlobal, setEnableOverlayGlobal] = React.useState(true);
  const [checkedCCTVId, setCheckedCCTVId] = React.useState('');
  const [currentGridNum, setCurrentGridNum] = React.useState(null);

  useHotkeys('c', () => setDialogOpen(true));
  const autoPlayIndexRef = React.useRef(0);
  const preLoadMapRef = React.useRef(new Map());
  const setLeftSmallPlayerRef = React.useRef(()=>{});
  const gridNumNormalized = getRealIndex(currentGridNum, gridDimension, cctvsSelectedArray)

  const maximizeGrid = React.useCallback(gridNum => {
    const realIndex = getRealIndex(gridNum, gridDimension, cctvsSelectedArray)
    const cctv = cctvsSelectedArray[realIndex];
    const cctvId = cctv.cctvId;
    const preloadMap = preLoadMapRef.current;
    const preloadElement = preloadMap.get(cctvId.toString());
    console.log(cctvId, preloadMap, preloadElement)
    mirrorModalPlayer(preloadElement, modalPlayer);
    setEnableOverlayModal(enableOverlayGlobal);
    setOverContentlayModal(cctv.title)
    setModalOpen(true);
    setCurrentGridNum(gridNum)
    autoPlayIndexRef.current = gridNum;
  },[modalPlayer, gridDimension, cctvsSelectedArray, enableOverlayGlobal])

  useAutoPlay({autoPlay, autoInterval, maximizeGrid, autoPlayIndexRef});

  const toggleAutoPlay = React.useCallback(() => {
    setAutoPlay(autoPlay => {
      return !autoPlay;
    })
  },[setAutoPlay])

  const toggleOverlayGlobal = React.useCallback(() => {
    if(modalOpen) {
      return;
    }
    setEnableOverlayGlobal(global => {
      return !global;
    })
  },[modalOpen, setEnableOverlayGlobal])

  const setCCTVsSelectedArrayNSave = React.useCallback((cctvsArray) =>{
    setCCTVsSelectedAray(cctvsArray);
    saveSelectedCCTVs(cctvsArray);
  },[saveSelectedCCTVs])

  const setCCTVsNotSelectedArrayNSave = React.useCallback((cctvsArray) => {
    setCCTVsNotSelectedArray(cctvsArray);
    saveNotSelectedCCTVs(cctvsArray);
  },[saveNotSelectedCCTVs])

  const setOptionsNSave = React.useCallback((key, value) => {
    key === 'gridDimension' && setGridDimension(value);
    key === 'autoInterval' && setAutoInterval(value);
    const options = {
      ...savedOptions,
      [key]: value
    }
    saveOptions(options)    
  },[saveOptions, savedOptions])

  return (
    <div className="App">
      <header className="App-header">
        <Box width="100%" height="100%" overflow="hidden">
          {!modalOpen && cctvsSelectedArray.length === 0 &&
            <Box sx={{marginTop: '30px'}}>Press "c" to manage cctv urls.</Box>
          }
          <GridVideos
            setPlayer={setLeftSmallPlayerRef.current}
            cctvsSelected={cctvsSelectedArray}
            preLoadMapRef={preLoadMapRef}
            maximizeGrid={maximizeGrid}
            toggleAutoPlay={toggleAutoPlay}
            autoPlay={autoPlay}
            gridDimension={gridDimension}
            enableOverlayGlobal={enableOverlayGlobal}
            toggleOverlayGlobal={toggleOverlayGlobal}
          ></GridVideos>
          <ModalBox 
            open={modalOpen} 
            currentGridNum={gridNumNormalized} 
            gridDimension={gridDimension}
            keepMounted={true} 
            autoPlay={autoPlay} 
            setOpen={setModalOpen} 
            contentWidth="80%" 
            contentHeight="auto"
          >
            <HLSPlayer 
              fill={true}
              responsive={true}
              setPlayer={setModalPlayer}
              aspectRatio={"16:9"}
              enableOverlay={enableOverlayModal}
              overlayContent={overlayContentModal}
              overlayBig={true}
              overlayModal={true}
            ></HLSPlayer>
          </ModalBox>
          <ConfigDialog 
            open={dialogOpen} 
            cctvsNotSelected={cctvsNotSelectedArray}
            cctvsSelected={cctvsSelectedArray}
            setCCTVsSelectedAray={setCCTVsSelectedArrayNSave}
            setCCTVsNotSelectedArray={setCCTVsNotSelectedArrayNSave}
            setOptionsNSave={setOptionsNSave}
            gridDimension={gridDimension}
            autoInterval={autoInterval}
            setDialogOpen={setDialogOpen}
            checkedCCTVId={checkedCCTVId}
            setCheckedCCTVId={setCheckedCCTVId}
          ></ConfigDialog>
        </Box>
      </header>
    </div>
  );
}

export default App;
