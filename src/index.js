import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


// Global variables
const FPS = 60;// FrameRate
var canvas = null;
var ctx = null;
window.onload = Init;

var bInstantDraw = false;
var MOVES_PER_UPDATE = 100; //How many pixels get placed down
var bDone = false;
var width; //canvas width
var height; //canvas height
var colorSteps = 32;

var imageData;
var grid;
var colors;

var currentPos;
var prevPositions;


function Init()
{
    canvas = document.getElementById('canvas'); // Get the HTML element with the ID of 'canvas'
	width = '256';
	height = '128';
    ctx = canvas.getContext('2d'); 
	
	imageData = ctx.createImageData(width,height); //Needed to do pixel manipulation
	
	grid = []; //Grid for the labyrinth algorithm
	colors = []; //Array of all colors
	prevPositions = []; //Array of previous positions, used for the recursive backtracker algorithm
	
	for(var r = 0; r < colorSteps; r++)
	{
		for(var g = 0; g < colorSteps; g++)
		{
			for(var b = 0; b < colorSteps; b++)
			{
				colors.push(new Color(r * 255 / (colorSteps - 1), g * 255 / (colorSteps - 1), b * 255 / (colorSteps - 1)));
				//Fill the array with all colors
			}
		}
	}
	
	for(var x = 0; x < width; x++)
	{

		grid.push(new Array());
		for(var y = 0; y < height; y++)
		{
			grid[x].push(0); //Set up the grid
		}
	}
	
	currentPos = new Point(Math.floor(Math.random() * width),Math.floor(Math.random() * height)); 
	
	grid[currentPos.x][currentPos.y] = 1;
	prevPositions.push(currentPos);
	ChangePixel(imageData, currentPos.x, currentPos.y, colors.pop());
	
	if(bInstantDraw)
	{
		do
		{
			var notMoved = true;
			while(notMoved)
			{
				var availableSpaces = CheckForSpaces(grid);
				
				if(availableSpaces.length > 0)
				{
					var test = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
					prevPositions.push(currentPos);
					currentPos = test;
					grid[currentPos.x][currentPos.y] = 1;
					ChangePixel(imageData, currentPos.x, currentPos.y, colors.pop());
					notMoved = false;
				}
				else
				{
					if(prevPositions.length !== 0)
					{
						currentPos = prevPositions.pop();
					}
					else
					{
						break;
					}
				}
			}
		}
		while(prevPositions.length > 0)
		console.warn(colors.length);
		ctx.putImageData(imageData,0,0);
	}
	else
	{
		setInterval(GameLoop, 1000 / FPS);
	}
}

// Main program loop
function GameLoop()
{
	Update();
	Draw();
}

// Game logic goes here
function Update()
{
	if(!bDone)
	{
		var counter = MOVES_PER_UPDATE;
		while(counter > 0) //For speeding up the drawing
		{
			var notMoved = true;
			while(notMoved)
			{
				var availableSpaces = CheckForSpaces(grid); //Find available spaces
				
				if(availableSpaces.length > 0) //If there are available spaces
				{
					prevPositions.push(currentPos); //add old position to prevPosition array
					currentPos = availableSpaces[Math.floor(Math.random() * availableSpaces.length)]; //pick a random available space
					grid[currentPos.x][currentPos.y] = 1; //set that space to filled
					ChangePixel(imageData, currentPos.x, currentPos.y, colors.pop()); //pop color of the array and put it in that space
					notMoved = false;
				}
				else
				{
					if(prevPositions.length !== 0)
					{
						currentPos = prevPositions.pop(); //pop to previous position where spaces are available
					}
					else
					{
						ctx.putImageData(imageData,0,0);
						bDone = true;
						break;
					}
				}
			}
			counter--;
		}
	}
}
function Draw()
{
	// Clear the screen
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle='#fff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	ctx.putImageData(imageData,0,0);
}

function CheckForSpaces(inGrid) //Checks for available spaces then returns back all available spaces
{
	var availableSpaces = [];
	
	if(currentPos.x > 0)
	{
		if(inGrid[currentPos.x - 1][currentPos.y] === 0)
		{
			availableSpaces.push(new Point(currentPos.x - 1, currentPos.y));
		}
	}
	else if(inGrid[width - 1][currentPos.y] === 0)
	{
		availableSpaces.push(new Point(width - 1, currentPos.y));
	}
	
	if(currentPos.x < width - 1)
	{
		if(inGrid[currentPos.x + 1][currentPos.y] === 0)
		{
			availableSpaces.push(new Point(currentPos.x + 1, currentPos.y));
		}
	}
	else if(inGrid[0][currentPos.y] === 0)
	{
		availableSpaces.push(new Point(0, currentPos.y));
	}
	
	if(currentPos.y > 0)
	{
		if(inGrid[currentPos.x][currentPos.y - 1] === 0)
		{
			availableSpaces.push(new Point(currentPos.x, currentPos.y - 1));
		}
	}
	else if(inGrid[currentPos.x][height - 1] === 0)
	{
		availableSpaces.push(new Point(currentPos.x, height - 1));
	}
	
	if(currentPos.y < height - 1)
	{
		if(inGrid[currentPos.x][currentPos.y + 1] === 0)
		{
			availableSpaces.push(new Point(currentPos.x, currentPos.y + 1));
		}
	}
	else if(inGrid[currentPos.x][0] === 0)
	{
		availableSpaces.push(new Point(currentPos.x, 0));
	}
	
	return availableSpaces;
}

function ChangePixel(data, x, y, color) //Quick function to simplify changing pixels
{
	data.data[((x + (y * width)) * 4) + 0] = color.r;
	data.data[((x + (y * width)) * 4) + 1] = color.g;
	data.data[((x + (y * width)) * 4) + 2] = color.b;
	data.data[((x + (y * width)) * 4) + 3] = 255;
}

/*Needed Classes*/
function Point(xIn, yIn)
{
    this.x = xIn;
    this.y = yIn;
}

function Color(r, g, b)
{
	this.r = r;
	this.g = g;
	this.b = b;
	this.hue = Math.atan2(Math.sqrt(3) * (this.g - this.b), 2 * this.r - this.g, this.b);
	this.min = Math.min(this.r, this.g);
	this.min = Math.min(this.min, this.b);
	this.min /= 255;
	this.max = Math.max(this.r, this.g);
	this.max = Math.max(this.max, this.b);
	this.max /= 255;
	this.luminance = (this.min + this.max) / 2;
	if(this.min === this.max)
	{
		this.saturation = 0;
	}
	else if(this.luminance < 0.5)
	{
		this.saturation = (this.max - this.min) / (this.max + this.min);
	}
	else if(this.luminance >= 0.5)
	{
		this.saturation = (this.max - this.min) / (2 - this.max - this.min);
	}
}
function RainbowImg() {
    return (
        <div>
            <canvas id='canvas' >
                Sorry your browser does not support Canvas, try Firefox or Chrome!
            </canvas>
        </div>
    );
}

ReactDOM.render(
    <RainbowImg />
    , document.getElementById('root'));