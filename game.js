
const canvas = document.getElementById('canvas1');
const context = canvas.getContext('2d');

//#region GAME
let score = 0;

//input--------------------------------------------------------------------------
function ComputeDirection(_dir)
{
    let d = {x:0, y:0};
    switch(_dir)
    {
        case Direction.DOWN:
            d.y = 1;
            break;
        case Direction.UP:
            d.y = -1;
            break;
        case Direction.LEFT:
            d.x = -1;
            break;
        case Direction.RIGHT:
            d.x = 1;
            break;
    }
    return d;
}
const Direction =
{
    RIGHT : 0,
    UP : 1,
    LEFT : 2,
    DOWN : 3,
    NODIR : 4,

    Negate : function(_dirToNegate)
    {
        switch(_dirToNegate)
        {
            case Direction.RIGHT:
                return Direction.LEFT; 
                break;
            case Direction.UP:
                return Direction.DOWN; 
                break;
            case Direction.LEFT:
                return Direction.RIGHT; 
                break;
            case Direction.DOWN:
                return Direction.UP; 
                break;
            case Direction.NODIR:

                break;
        }
    }

}
let input = Direction.NODIR;

window.addEventListener('keydown', OnKeyDown, true);
function OnKeyDown(ev)
{
    switch(ev.keyCode)
    {
        case 68 || 39://right
            input = Direction.RIGHT;
            break;
        case 87 || 38://up
            input = Direction.UP;
            break;
        case 65 || 37://left
            input = Direction.LEFT;
            break;
        case 83 || 40://down
            input = Direction.DOWN;
            break;
        
    }
}
//input--------------------------------------------------------------------------
//arena--------------------------------------------------------------------------


let arena =
{
    
    tileSize: 32,
    tileNumX: 20,
    tileNumY: 20,

    Draw : function()
    {
        for(let x = 0; x < this.tileNumX; x++)
        {
            for(let y = 0; y < this.tileNumY; y++)
            {
                context.beginPath();
                context.rect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                context.strokeStyle = 'red';
                context.stroke();
            }
        }
    }

}



//arena--------------------------------------------------------------------------
//apple--------------------------------------------------------------------------
let apple =
{
    position : {x:0, y:0},

    MakeNew : function()
    {
        this.position =
        {
            x: Math.floor(Math.random() * arena.tileNumX),
            y: Math.floor(Math.random() * arena.tileNumY)
        }

        while(snake.IsPosInSnake(this.position))
        {
            console.log('tried to randomize apple inside the snake');
            this.position =
            {
                x: Math.floor(Math.random() * arena.tileNumX),
                y: Math.floor(Math.random() * arena.tileNumY)
            }
        }
    },

    Draw : function()
    {
        context.fillStyle = 'green';
        context.beginPath();
        context.arc
        (
            this.position.x * arena.tileSize + (arena.tileSize/2),
            this.position.y * arena.tileSize + (arena.tileSize/2),
            10,
            0,
            2 * Math.PI
        );
        context.fill();
    }

}
//apple--------------------------------------------------------------------------
//snake--------------------------------------------------------------------------
let snake =
{
    positions : [],

    Start : function()
    {
        let initPos =
        {
            x: (arena.tileNumX / 2) + ( Math.floor((Math.random() * arena.tileNumX / 2)) - (arena.tileNumX / 4)),
            y: (arena.tileNumY / 2) + ( Math.floor((Math.random() * arena.tileNumY / 2)) - (arena.tileNumY / 4))
        }
        this.positions = [];
        this.positions.push(initPos);

        let randDir = Math.floor((Math.random() * 4));
        for(let i = 1; i < 5; i++)
        {
            let nPos = {}
            switch(randDir)
            {
                case Direction.DOWN:
                    nPos.x = initPos.x;
                    nPos.y = initPos.y + i;
                    break;
                case Direction.UP:
                    nPos.x = initPos.x;
                    nPos.y = initPos.y - i;
                    break;
                case Direction.LEFT:
                    nPos.x = initPos.x - i;
                    nPos.y = initPos.y;
                    break;
                case Direction.RIGHT:
                    nPos.x = initPos.x + i;
                    nPos.y = initPos.y;
                    break;
            }
            this.positions.push(nPos);
        }

        
    },

    Update : function()
    {
        let prevPos = this.positions[0];
        //check the next pos, and the case the snake tries to move in his neck
        let nextPos = {x: this.positions[0].x + ComputeDirection(input).x, y: this.positions[0].y + ComputeDirection(input).y};
        if(nextPos.x == this.positions[1].x && nextPos.y == this.positions[1].y)
        {
            input = Direction.Negate(input);
            nextPos = {x: this.positions[0].x + ComputeDirection(input).x, y: this.positions[0].y + ComputeDirection(input).y};
        }
        this.positions[0] = nextPos;
        //wrap the position
        if(this.positions[0].x >= arena.tileNumX)
        {
            this.positions[0].x = 0;
        }
        if(this.positions[0].x < 0)
        {
            this.positions[0].x = arena.tileNumX - 1
        }
        if(this.positions[0].y >= arena.tileNumY)
        {
            this.positions[0].y = 0;
        }
        if(this.positions[0].y < 0)
        {
            this.positions[0].y = arena.tileNumY - 1
        }
        
        //set array of positions after moving
        for(let i = 1; i < this.positions.length; i++)
        {
            let tPrevPos = prevPos;
            prevPos = this.positions[i];
            this.positions[i] = tPrevPos;
        }
        //eat apple
        if(this.positions[0].x == apple.position.x)
        {
            if(this.positions[0].y == apple.position.y)
            {
                let npp = {x:this.positions[this.positions.length - 1].x, y:this.positions[this.positions.length - 1].y}
                this.positions.push(npp);
                apple.MakeNew();
                
            }
        }
        //die
        for(let i = 1; i < this.positions.length; i++)
        {
            if(this.positions[i].x == this.positions[0].x)
            {
                if(this.positions[i].y == this.positions[0].y)
                {
                    window.location.reload();
                }
            }
        }

    },

    Draw : function()
    {

        //body
        for(let i = 1; i < this.positions.length; i++)
        {
            context.fillStyle = 'blue';
            context.fillRect
            (
                this.positions[i].x * arena.tileSize + 5,
                this.positions[i].y * arena.tileSize + 5,
                arena.tileSize - 10,
                arena.tileSize - 10
            );
        }
        //head
        context.fillStyle = 'green';
        context.fillRect
        (
            this.positions[0].x * arena.tileSize + 5,
            this.positions[0].y * arena.tileSize + 5,
            arena.tileSize - 10,
            arena.tileSize - 10
        );
    },
    
    IsPosInSnake : function(_pos)
    {
        for(let i = 0; i < this.positions.length; i++)
        {
            //check if x is the same
            if(this.positions[i].x == _pos.x)
            {
                if(this.positions[i].y == _pos.y)
                {
                    return true;
                }
            }
        }
        return false;
    }
    
}


//snake--------------------------------------------------------------------------
//loop---------------------------------------------------------------------------
arena.Draw();
snake.Start();
snake.Draw();
apple.MakeNew();
apple.Draw();

let frames = 0;
window.requestAnimationFrame(gameLoop);
function gameLoop(_t)
{
    if(Math.floor(frames) % 10 == 0)
    {
        if(input != Direction.NODIR)
        {
            snake.Update();
        }
        

        context.clearRect(0,0, canvas.width, canvas.height);
        arena.Draw();
        snake.Draw();
        apple.Draw();
    }
    

    frames++;
    window.requestAnimationFrame(gameLoop);
}

//loop---------------------------------------------------------------------------

//#endregion
