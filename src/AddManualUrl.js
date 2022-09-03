import React from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styled from 'styled-components';
import HLSPlayer from './HLSPlayer';
import {replace} from './lib/arrayUtil';
import { SmallMarginTextField } from './template/smallComponents';

const Container = styled.div`
  /* margin-left: 15px; */
  display: flex;
  padding: 20px;
  /* height: 50px; */
`;
const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 300px);
  padding: 10px;
  padding-top: 0px;
  justify-content: space-between;
`;
const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const CustomTextField = styled(TextField)`
  width: ${props => props.width || "100px"};
  .MuiInputBase-input {
    font-size: ${props => props.fontSize || "12px"};
    width: ${props => props.width || "100px"};
  }
`

const DEFAULT_LAT = 37.52803;
const DEFAULT_LNG = 126.87332;
const DEFAULT_MAP_LEVEL = 9;

function AddManualUrl(props) {
  const {
    allCCTVs, 
    checkedCCTVId, 
    checkedInSelected, 
    setCCTVsNotSelectedArray, 
    setCCTVsSelectedArray,
    setChanged
  } = props;
  const [url, setUrl] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [lat, setLAT] = React.useState(DEFAULT_LAT)
  const [lng, setLNG] = React.useState(DEFAULT_LNG);
  const [mapLevel, setMapLevel] = React.useState(DEFAULT_MAP_LEVEL);

  React.useEffect(() => {
    if(checkedCCTVId){
      const checkedCCTV = allCCTVs.find(cctv => cctv.cctvId === checkedCCTVId);
      if(checkedCCTV){
        setUrl(checkedCCTV.url || 'https://localhost');
        setTitle(checkedCCTV.title || '');
        setLAT(checkedCCTV.lat || DEFAULT_LAT);
        setLNG(checkedCCTV.lng || DEFAULT_LNG);
        setMapLevel(checkedCCTV.mapLevel || DEFAULT_MAP_LEVEL);
      }
    } else {
      setUrl('https://-');
      setTitle('');
      setLAT(DEFAULT_LAT);
      setLNG(DEFAULT_LNG);
      setMapLevel(DEFAULT_MAP_LEVEL);
    }
  },[allCCTVs, checkedCCTVId])

  const setPlayer = React.useCallback(() => {
    return null;
  },[])

  const onChangeUrl = React.useCallback((event) => {
    setUrl(event.target.value);
  },[])

  const source = React.useMemo(() => {
    return {
      url
    }
  },[url])

  const setTitleValue = React.useCallback((event) => {
    setTitle(event.target.value);
  },[])
  const setLATValue = React.useCallback((event) => {
    setLAT(parseFloat(event.target.value));
  },[])
  const setLNGValue = React.useCallback((event) => {
    setLNG(parseFloat(event.target.value));
  },[])
  const setMapLevelValue = React.useCallback((event) => {
    setMapLevel(parseInt(event.target.value));
  },[])

  const onDragOver = React.useCallback((event) => {
    event.preventDefault();
  },[])

  const onDrop = React.useCallback((event) => {
    event.preventDefault();
    const dropped = JSON.parse(event.dataTransfer.getData('application/json'));
    const {cctvId, title, url} = dropped;
    setTitle(title);
    setUrl(url);
  },[])

  const onClickAdd = React.useCallback(() => {
    if(checkedCCTVId){
      if(checkedInSelected){
        setCCTVsSelectedArray(cctvs => {
          const targetIndex = cctvs.findIndex(cctv => cctv.cctvId === checkedCCTVId);
          return replace(cctvs).index(targetIndex).value({
            ...cctvs[targetIndex],
            url,
            title,
            lat,
            lng,
            mapLevel
          })
        })
        setChanged(true);
        return;
      } else {
        setCCTVsNotSelectedArray(cctvs => {
          const targetIndex = cctvs.findIndex(cctv => cctv.cctvId === checkedCCTVId);
          return replace(cctvs).index(targetIndex).value({
            ...cctvs[targetIndex],
            url,
            title,
            lat,
            lng,
            mapLevel
          })
        })
        setChanged(true);
        return;
      }
    }
    const ALREADY_INDEX = allCCTVs.findIndex(cctv => cctv.url === url);
    if(ALREADY_INDEX >= 0){
      const alreadyCCTV = allCCTVs[ALREADY_INDEX];
      alert(`URL already exists! - [${alreadyCCTV.title}]`);
      return;
    }
    const newCCTV = {
      url,
      title,
      lng,
      lat,
      mapLevel,
      cctvId: Date.now(),
      num: Date.now()
    } 
    setCCTVsNotSelectedArray(cctvs => {
      return [...cctvs, newCCTV]
    })
    setChanged(true);
  },[checkedCCTVId, allCCTVs, url, title, lng, lat, mapLevel, setCCTVsNotSelectedArray, setChanged, checkedInSelected, setCCTVsSelectedArray])

  return (
    <Container onDragOver={onDragOver} onDrop={onDrop}>
        <Box width="300px">
          <HLSPlayer 
            source={source}
            aspectRatio="16:9"
            fill={true}
            enableOverlay={false}
            setPlayer={setPlayer}
          ></HLSPlayer>
        </Box>
        <SubContainer>
          <TitleContainer>
            <TextField onChange={setTitleValue} value={title} label="Title" variant="outlined" size="small"></TextField>
            <CustomTextField onChange={setLATValue} value={lat} width="100px" label="LAT" variant="outlined" size="small"></CustomTextField>
            <CustomTextField onChange={setLNGValue} value={lng} label="LNG" variant="outlined" size="small"></CustomTextField>
            <CustomTextField onChange={setMapLevelValue} value={mapLevel} label="MAP level" variant="outlined" size="small"></CustomTextField>
          </TitleContainer>
          <TextField fullWidth onChange={onChangeUrl} value={url} label="Url" variant="outlined" size="small"></TextField>
          <Button onClick={onClickAdd}>{checkedCCTVId ? "Update":"Add"}</Button>
        </SubContainer>
    </Container>
  )
}

export default React.memo(AddManualUrl);
