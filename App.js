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
		],
		doNotDrag:false,//在drag LayoutAnimation時，禁止其他drag
	};

	componentWillUpdate(){//drag會swapDrag，會改變tags state，觸發componentWillUpdate
		LayoutAnimation.easeInEaseOut();
	}

	/*
	GestureState={
		dx:number,//x軸移動總距離
		dy:number,//accumulated distance of the gesture since the touch started
		moveX:number,//x軸現在位置
		moveY:number,//the latest screen coordinates of the recently-moved touch
		numberActiveTouches:number,//幾指觸控
		stateID:number,//ID，持續到觸控結束
		vx:number,//x軸的手勢速度
		vy:number,//current velocity of the gesture
		x0:number,//x軸的初始座標
		y0:number,//the screen coordinates of the responder grant
	};
	*/

	_panResponder=PanResponder.create({//drag基本用法
		//Handle drag gesture
		onMoveShouldSetPanResponder:(_, gestureState)=>this.onMoveShouldSetPanResponder(gestureState),//要不要開始drag
		onPanResponderGrant:(_, gestureState)=>this.onPanResponderGrant(),//同意後
		onPanResponderMove:(_, gestureState)=>this.onPanResponderMove(gestureState),//移動時
		//Handle drop gesture
		onPanResponderRelease:(_, gestureState)=>this.onPanResponderEnd(),//放開時
		onPanResponderTerminate:(_, gestureState)=>this.onPanResponderEnd(),//結束時
	});

	//Find out if we need to start handling tag dragging gesture
	onMoveShouldSetPanResponder=gestureState=>{
		const {dx, dy, moveX, moveY, numberActiveTouches}=gestureState;

		//Do not set pan responder if a multi touch gesture is occurring
		if(numberActiveTouches!==1){//0指觸控或2指以上就不接受
			return false;
		}

		//or if there was no movement since the gesture started
		if(dx===0&&dy===0){//移動才開始接受
			return false;
		}

		//Find the tag below user's finger at given coordinates
		const tag=this.findTagAtCoordinates(moveX, moveY);
		//tag都有存自己的位置，這裡去抓是drag哪個tag
		if(tag){//有drag到tag才接受
			//assign it to `this.tagBeingDragged` while dragging
			this.tagBeingDragged=tag;//把drag到的tag存起來，做之後的操作
			//and tell PanResponder to start handling the gesture by calling `onPanResponderMove`
			return true;//同意開始drag
		}

		return false;
	};

	//Called when gesture is granted
	onPanResponderGrant=()=>{//准許後設定該tag正在被drag，tag的style就會改變
		this.updateTagState(this.tagBeingDragged, {isBeingDragged:true});
	};

	//Handle drag gesture
	onPanResponderMove=gestureState=>{
		const {moveX, moveY}=gestureState;//現在的座標
		//Do nothing if dnd is disabled
		if(this.state.doNotDrag){//在swap動畫跑的時候會設定不能drag，300毫秒
			return;
		}
		//Find the tag we're dragging the current tag over
		const draggedOverTag=this.findTagAtCoordinates(moveX, moveY, this.tagBeingDragged);//找現在座標對應到的tag，排除正在drag的tag
		if(draggedOverTag){//有的話就交換
			this.swapTags(this.tagBeingDragged, draggedOverTag);
		}
	};

	//Called after gesture ends
	onPanResponderEnd=()=>{
		this.updateTagState(this.tagBeingDragged, {isBeingDragged:false});
		this.tagBeingDragged=undefined;
	};

	updateTagState=(tag, props)=>//update isBeingDragged，讓tag可以改變style
		this.setState({tags:this.state.tags.map(e=>e.title!==tag.title?e:{
			...e,
			...props,
		})});

	findTagAtCoordinates=(x, y, exceptTag)=>//exceptTag是正在拖的那個tag
		this.state.tags.find(tag=>
			tag.tlX&&tag.tlY&&tag.brX&&tag.brY
			&&this.isPointWithinArea(x, y, tag.tlX, tag.tlY, tag.brX, tag.brY)
			&&(!exceptTag||exceptTag.title!==tag.title)
		);

	removeTag=tag=>this.setState({tags:this.state.tags.filter(({title})=>title!==tag.title)});

	//Swap two tags
	swapTags=(draggedTag, anotherTag)=>{//交換同時暫時不準drag，300毫秒後再開放
		this.setState(state=>({
			tags:this.moveArrayElement(
				state.tags,
				state.tags.findIndex(({title})=>title===draggedTag.title),
				state.tags.findIndex(({title})=>title===anotherTag.title),
			),
			doNotDrag:true,
		}), ()=>setTimeout(()=>this.setState({doNotDrag:false}), 300));
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
	)=>{
		if(to>array.length){//應該不會有這種情形發生，因為是findArray內的index
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
			},
			...arr.slice(to),
		];
	};

	tag=[];
	
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
								ref={tag=>this.tag[i]=tag}
								style={[styles.tag, tag.isBeingDragged?styles.tagBeingDragged:{}]}
								onLayout={()=>{
									this.tag[i]&&this.tag[i].measure((x, y, width, height, screenX, screenY)=>this.updateTagState(tag, {
										tlX:screenX,
										tlY:screenY,
										brX:screenX+width,
										brY:screenY+height,
									}))
								}}
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
