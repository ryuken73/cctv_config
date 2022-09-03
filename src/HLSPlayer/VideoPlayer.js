import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Controls from './Controls.json';

class VideoPlayer extends Component {
    playerId = `video-player-${Date.now() + (Math.random()*10000).toFixed(0)}`
    player = {};
    componentDidMount() {
        console.log('player did mount:', this.playerId)
        this.init_player(this.props);
        this.init_player_events(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.set_controls_visibility(this.player, nextProps.hideControls);
        // console.log('&&&& in videoPlayer: ', this.props.src, nextProps.src)
        if(this.props.src !== nextProps.src){
            this.init_player(nextProps);
        }
    }

    componentWillUnmount() {
        console.log('player will umount:', this.playerId, this.player.isDisposed())
        // document.querySelector(`#${this.playerId}`).remove();
        if (this.player.isDisposed() === false) this.player.dispose();
        
    }

    init_player(props) {
        try {
            console.log('#### init_player: ',props,this.playerId, this.player.isDisposed &&  this.player.isDisposed() , document.querySelector(`#${this.playerId}`))
            const playerOptions = this.generate_player_options(props);
            const {
                enableOverlay=false, 
                overlayBig=false,
                overlayModal=false,
                overlayContent="This is HLS Player!",
                overlayRightBtn="Right Button",
                overlayLeftBtn="Left Button",
                startSecondsOffset=0,
            } = props;
            if(this.player.isDisposed == undefined || this.player.isDisposed &&  this.player.isDisposed()){
                console.log('initialize player:', this.playerId, this.player);
                // this.player = window.videojs(document.querySelector(`#${this.playerId}`), playerOptions);
                this.player = window.videojs(document.querySelector(`#${this.playerId}`), playerOptions);
            }
            console.log('#######', playerOptions);
            if(enableOverlay){
                this.player.overlay(
                    {
                        overlays:[
                            {
                                content: overlayContent,
                                start:'playing',
                                end:'dispose',
                                showBackground:true,
                                align: 'bottom-right',
                                class: overlayModal ? 'title-overlay-modal' : overlayBig ? 'title-overlay-big' : 'title-overlay'
                            },
                        ]
                    }
                )
            }
            if(!enableOverlay){
                this.player.overlay({
                    content: 'hide overlay',
                    class: 'overlay-hide'
                });
            }
 
            // if(enableOverlay){
            //     this.player.overlay(
            //         {
            //             overlays:[
            //                 {
            //                     content: overlayContent,
            //                     start:'playing',
            //                     end:'dispose',
            //                     showBackground:true,
            //                     class:'title-overlay'
            //                 },
            //                 {
            //                     content: overlayRightBtn,
            //                     start:'loadstart',
            //                     end:'dispose',
            //                     align:'right',
            //                     showBackground:false
            //                 },
            //                 {
            //                     content: overlayLeftBtn,
            //                     start:'loadstart',
            //                     end:'dispose',
            //                     align:'left',
            //                     showBackground:false
            //                 },
            //         ]
            //         }
            //     )
            // }

            this.player.src(props.src)
            this.player.poster(props.poster)
            this.set_controls_visibility(this.player, props.hideControls);

        } catch(error) {
            console.error(error)
        }
  
    }

    generate_player_options(props){
        const playerOptions = {};
        playerOptions.inactivityTimeout = props.inactivityTimeout;
        playerOptions.controls = props.controls;
        playerOptions.autoplay = props.autoplay;
        playerOptions.preload = props.preload;
        playerOptions.width = props.width;
        playerOptions.height = props.height;
        playerOptions.bigPlayButton = props.bigPlayButton;
        playerOptions.liveui = props.liveui;
        playerOptions.errorDisplay = false;
        if(props.fluid) playerOptions.fluid = true;
        if(props.responsive) playerOptions.responsive = true;
        if(props.aspectRatio) playerOptions.aspectRatio = props.aspectRatio;
        if(props.fill) playerOptions.fill = props.fill;

        // playerOptions.fluid = props.fluid;
        // playerOptions.responsive = props.responsive;
        // playerOptions.aspectRatio = props.aspectRatio;
        playerOptions.controlBar = {
            'pictureInPictureToggle': false
        };
        const hidePlaybackRates = props.hidePlaybackRates || props.hideControls.includes('playbackrates');
        if (!hidePlaybackRates) playerOptions.playbackRates = props.playbackRates;
        return playerOptions;
    }

    set_controls_visibility(player, hidden_controls){
        Object.keys(Controls).map(x => { player.controlBar[Controls[x]].show() })
        hidden_controls.map(x => { player.controlBar[Controls[x]].hide() });
    }

    init_player_events(props) {
        let position = 0;

        this.player.ready(() => {
            props.onReady(this.player);
            window.player = this.player;
        });
        this.player.on('play', () => {
            props.onPlay(this.player.currentTime());
        });
        this.player.on('pause', () => {
            props.onPause(this.player.currentTime());
        });
        this.player.on('timeupdate', (e) => {
            props.onTimeUpdate(this.player.currentTime());
        });
        this.player.on('canplay', () => {
            props.onCanPlay(this.player)
        })
        this.player.on('seeking', () => {
            props.onSeeking(this.player.currentTime());
        });   
        this.player.on('seeked', () => {
            let completeTime = Math.floor(this.player.currentTime());
            props.onSeeked(position, completeTime);
        });
        this.player.on('ended', () => {
            props.onEnd();
        });
        this.player.on('error', () => {
            console.log(this.player.error());
            props.onError(this.player.error());
        });
        this.player.on('stalled', () => {
            props.onOtherEvent('stalled')
        })
        this.player.on('suspend', () => {
            props.onOtherEvent('suspend')
        })
        this.player.on('waiting', () => {
            props.onOtherEvent('waiting')
        })
        this.player.on('waiting', () => {
            props.onOtherEvent('abort')
        })
        this.player.on('loadstart', () => {
            // console.log('loadstart');
            props.onLoadStart(this.player);
            props.onOtherEvent('loadstart', this.player)
        })
        this.player.on('playing', () => {
            props.onOtherEvent('playing')
        })
        this.player.on('emptied', () => {
            props.onOtherEvent('emptied')
        })
        this.player.on('ratechange', () => {
            props.onOtherEvent('ratechange', this.player);
        })
        this.player.on('loadedmetadata', () => {
            // console.log('%%% loadedmetadata', this.player.markers)
            // console.log('%%% loadedmetadata', this.player.overlay)
            // this.player.markers.add([{ time: 40, text: "I'm added"}]);

            // this.player.markers.add([{ time: 500, text: "I'm added"}])
            
        })
        this.player.on('durationchange', () => {
            // console.log('#####', this.player.duration())
            props.onOtherEvent('durationchange', this.player)
        })

    }

    render() {
        return (
            <video id={this.playerId} className={`video-js vjs-liveui ${this.props.bigPlayButtonCentered? 'vjs-big-play-centered' : ''} ${this.props.className}`}></video>
        )
    }
}

VideoPlayer.propTypes = {
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    poster: PropTypes.string,
    controls: PropTypes.bool,
    autoplay: PropTypes.bool,
    preload: PropTypes.oneOf(['auto', 'none', 'metadata']),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hideControls: PropTypes.arrayOf(PropTypes.string),
    bigPlayButton: PropTypes.bool,
    bigPlayButtonCentered: PropTypes.bool,
    onReady: PropTypes.func,
    onLoadStart: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onTimeUpdate: PropTypes.func,
    onSeeking: PropTypes.func,
    onSeeked: PropTypes.func,
    onEnd: PropTypes.func,
    onError: PropTypes.func,
    onOtherEvent: PropTypes.func,
    playbackRates: PropTypes.arrayOf(PropTypes.number),
    hidePlaybackRates: PropTypes.bool,
    className: PropTypes.string
}

VideoPlayer.defaultProps = {
    src: "",
    poster: "",
    controls: true,
    autoplay: false,
    preload: 'auto',
    playbackRates: [1, 1.5, 2, 4, 8, 16],
    hidePlaybackRates: false,
    className: "",
    hideControls: [],
    bigPlayButton: true,
    bigPlayButtonCentered: true,
    onReady: () => { },
    onLoadStart: () => {},
    onPlay: () => { },
    onPause: () => { },
    onTimeUpdate: () => { },
    onSeeking: () => { },
    onSeeked: () => { },
    onEnd: () => { }
}


export default React.memo(VideoPlayer);