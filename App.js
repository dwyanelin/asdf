import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	LayoutAnimation,
	UIManager,
	PanResponder,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

UIManager.setLayoutAnimationEnabledExperimental&&UIManager.setLayoutAnimationEnabledExperimental(true);

export default class App extends Component{
	state={
		tags:[
			{title:'#love'},
			{title:'#instagood'},
			{title:'#photooftheday'},
			{title:'#beautiful'},
			{title:'#fashion'},
			{title:'#happy'},
			{title:'#tbt'},
			{title:'#cute'},
			{title:'#followme'},
			{title:'#like4like'},
			{title:'#follow'},
			{title:'#followme'},
		],
	};

	componentWillUpdate(){
		LayoutAnimation.easeInEaseOut();
	}

	_panResponder=PanResponder.create({
		//Handle drag gesture
		onMoveShouldSetPanResponder:(_, gestureState)=>this.onMoveShouldSetPanResponder(gestureState),
		onPanResponderGrant:(_, gestureState)=>this.onPanResponderGrant(),
		onPanResponderMove:(_, gestureState)=>this.onPanResponderMove(gestureState),
		//Handle drop gesture
		onPanResponderRelease:(_, gestureState)=>this.onPanResponderEnd(),
		onPanResponderTerminate:(_, gestureState)=>this.onPanResponderEnd(),
	});

	//Find out if we need to start handling tag dragging gesture
	onMoveShouldSetPanResponder=gestureState=>{
		const {dx, dy, moveX, moveY, numberActiveTouches}=gestureState;

    // Do not set pan responder if a multi touch gesture is occurring
    if(numberActiveTouches!==1){
      return false;
    }

    // or if there was no movement since the gesture started
    if(dx===0&&dy===0){
      return false;
    }

    // Find the tag below user's finger at given coordinates
    const tag=this.findTagAtCoordinates(moveX, moveY);console.log(tag);
    if(tag){
      // assign it to `this.tagBeingDragged` while dragging
      this.tagBeingDragged=tag;
      // and tell PanResponder to start handling the gesture by calling `onPanResponderMove`
      return true;
    }

    return false;
	};

	//Called when gesture is granted
	onPanResponderGrant=()=>{
		this.updateTagState(this.tagBeingDragged, {isBeingDragged:true});
	};

	//Handle drag gesture
	onPanResponderMove=gestureState=>{
		const {moveX, moveY}=gestureState;
		console.log('onPanResponderMove', moveX, moveY);
	};

	//Called after gesture ends
	onPanResponderEnd=()=>{
		this.updateTagState(this.tagBeingDragged, {isBeingDragged:false});
    this.tagBeingDragged=undefined;
	};

	/*
	GestureState = {
		dx:number,//accumulated distance of the gesture since the touch started
		dy:number,//accumulated distance of the gesture since the touch started
		moveX:number,//the latest screen coordinates of the recently-moved touch
		moveY:number,//the latest screen coordinates of the recently-moved touch
		numberActiveTouches:number,//Number of touches currently on screen
		stateID:number,//ID of the gestureState- persisted as long as there at least one touch on screen
		vx:number,//current velocity of the gesture
		vy:number,//current velocity of the gesture
		x0:number,//the screen coordinates of the responder grant
		y0:number,//the screen coordinates of the responder grant
	};
	*/

	findTagAtCoordinates=(x, y, exceptTag)=>
    this.state.tags.find(tag=>
      tag.tlX&&tag.tlY&&tag.brX&&tag.brY
      &&this.isPointWithinArea(x, y, tag.tlX, tag.tlY, tag.brX, tag.brY)
      &&(!exceptTag||exceptTag.title!==tag.title)
    );

	removeTag=tag=>this.setState({tags:this.state.tags.filter(({title})=>title!==tag.title)});

	updateTagState=(tag, props)=>{
		this.setState({tags:this.state.tags.map(e=>e!==tag?e:{
			...e,
			...props,
		})});
  };

	isPointWithinArea=(pointX,//x coordinate
		pointY,//y coordinate
		areaTlX,//top left x coordinate
		areaTlY,//top left y coordinate
		areaBrX,//bottom right x coordinate
		areaBrY,//bottom right y coordinate
	)=>{
		return areaTlX<=pointX&&pointX<=areaBrX//is within horizontal axis
			&&areaTlY<=pointY&&pointY<=areaBrY;//is within vertical axis
	};

	moveArrayElement=(array,//array of objects
		from,//element to move index
		to,//index where to move
		mergeProps={}//merge additional props into the object
	)=>{
		if(to>array.length){
			return array;
		}

		//Remove the element we need to move
		const arr=[
			...array.slice(0, from),
			...array.slice(from+1),
		];

		//And add it back at a new position
		return [
			...arr.slice(0, to),
			{
				...array[from],
				...mergeProps,//merge passed props if any or empty object by default
			},
			...arr.slice(to),
		];
	};
	
	render(){
		const {tags}=this.state;
		return (
			<View style={styles.container} {...this._panResponder.panHandlers}>
				<View style={styles.tagsArea}>
					{tags.map((tag, i)=>
						<TouchableOpacity
							key={i}
							onPress={()=>{}}
						>
							<View
								ref={tag=>this.tag=tag}
								style={[styles.tag, /*this.tag.isBeingDragged?styles.tagBeingDragged:{}*/]}
								onLayout={()=>
									this.tag&&this.tag.measure((x, y, width, height, screenX, screenY)=>this.updateTagState(tag, {
										tlX:screenX,
										tlY:screenY,
										brX:screenX+width,
										brY:screenY+height,
									}))
								}
							>
								<TouchableOpacity
									onPress={()=>this.removeTag(tag)}
								>
									<Ionicons name="ios-close-circle-outline" size={16} color="#FFF" />
								</TouchableOpacity>
								<Text style={styles.title}> {tag.title}</Text>
							</View>
						</TouchableOpacity>
					)}
					<Text
						style={styles.add}
						onPress={()=>{}}
					>
						Add new
					</Text>
				</View>
			</View>
		);
	}
}

const styles=StyleSheet.create({
	container:{
		flex:1,
		alignItems:'center',
		justifyContent:'center',
		backgroundColor:'#2196F3',
	},
	tagsArea:{
		flexDirection:'row',
		flexWrap:'wrap',
		borderColor:'rgba(255,255,255,0.5)',
		borderRadius:5,
		borderWidth:2,
		padding:15,
		margin:15,
	},
	tag:{
		flexDirection:'row',
		alignItems:'center',
		backgroundColor:'rgba(255, 255, 255, .33)',
		borderColor:'rgba(255, 255, 255, .25)',
		borderRadius:20,
		borderWidth:1,
		paddingHorizontal:10,
		paddingVertical:3,
		marginBottom:8,
		marginRight:6,
	},
	tagBeingDragged:{
		backgroundColor:'rgba(255, 255, 255, .01)',
		borderStyle:'dashed',
	},
	title:{
		color:'#FFFFFF',
		fontSize:15,
		fontWeight:'normal',
	},
	add:{
		backgroundColor:'transparent',
		color:'#FFFFFF',
		padding:5,
		textDecorationLine:'underline',
	},
});
