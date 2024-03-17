import {defs, tiny} from './examples/common.js';
import { Text_Line } from './examples/text-demo.js';
import { Shape_From_File } from "./examples/obj-file-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Square,Cube, Axis_Arrows, Textured_Phong} = defs

//
function random_numb(min, max) {
    return Math.random() * (max - min) + min;
}

export class NASCAT extends Scene {

    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.shapes = {
            startingPage: new Cube(),
            side_L: new Cube(),
            side_R: new Cube(),
            tree_L: new Square(),
            tree_R: new Square(),
            road: new Cube(),
            horizon: new Cube(),
            horizon_R: new Cube(),
            horizon_L: new Cube(),
            axis: new Axis_Arrows(),
            player: new Shape_From_File("assets/cat.obj"),
            text: new Text_Line(40),
            dawg: new Square(),
        }

        this.materials = {
            grass: new Material(new Texture_Scroll_Y(), {
                color: hex_color("#000000"),
                ambient: 0.7, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/sides.png", "LINEAR_MIPMAP_LINEAR"),
                velocity: 1.0
            }),
            trees: new Material(new Textured_Phong, {
                color: hex_color("#000000"),
                ambient: 0.8, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/tree.png", "LINEAR_MIPMAP_LINEAR"),
                velocity: 1.0
            }),
            highway: new Material(new Texture_Scroll_Y(), {
                color: hex_color("#000000"),
                ambient: 0.7, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/road.png", "LINEAR_MIPMAP_LINEAR"),
                velocity: 1.0
            }),
            horizon: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/horizon.png", "LINEAR_MIPMAP_LINEAR"),
                velocity: 1.0
            }),
            horizon_R: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/horizon-R.png", "LINEAR_MIPMAP_LINEAR"),
                velocity: 1.0
            }),
            horizon_L: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/horizon_L.png", "LINEAR_MIPMAP_LINEAR"),
                velocity: 1.0
            }),
            player: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/Cat_texture.jpg"),
                velocity: 1.0
            }),
            dawg1: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/dawg.png"),
                velocity: 1.0
            }),
            dawg2: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/doge.png"),
                velocity: 1.0
            }),
            dawg3: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/husky.png"),
                velocity: 1.0
            }),
            startingPage: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                diffusivity: 0.3,
                specularity: 1,
                texture: new Texture("assets/cat.jpg", "LINEAR_MIPMAP_LINEAR"),
            }),
            endingPage: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                diffusivity: 0.3,
                specularity: 1,
                texture: new Texture("assets/the_end.jpg", "LINEAR_MIPMAP_LINEAR"),
            }),
        }
        const texture = new defs.Textured_Phong(1);
        this.text_image = new Material(texture, {
            ambient: 1, diffusivity: 0, specularity: 0,
            texture: new Texture("assets/text.png")
        });

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.poop = 0;

        //player_pos variables
        this.p_y = -0.25;
        this.p_x = 0;
        this.p_z = 1;

        // sidetoside move_speed
        this.m_spd = 0.05;

        // back/forth movement speed
        this.accel = 2;


        //Movement booleans
        this.is_accel = false;
        this.isdecel = false;
        this.is_L = false;
        this.is_R = false;


        // Setup surface Translations
        this.side_L = Mat4.translation(-16.5,-1.5,-10);
        this.side_R = Mat4.translation(16.5,-1.5,-10);
        this.road = Mat4.translation(0, -1.5, -10);

        //Setup Camera Matrix
        this.camera_matrix = Mat4.translation(0, -1, -8);

        //  Setup horizon
        // horizon coords
        let h_x = 0;
        let h_y = 13;
        let h_z = -40;

        //Doggy coords
        this.d_x = 0;
        this.d_y = 0;
        this.d_z = -40;

        //Tree coords
        this.t_lx=-3  ;
        this.t_y=1 ;
        this.t_lz=-40  ;
        this.t_rx=3  ;
        this.t_rz=-50  ;

        //Scaling of tree
        this.t_scl= 2;

        //Tree speed;
        this.t_spd =1;

        //Scaling of the dog
        this.d_scl = 0.5;

        //speed of dog
        this.d_spd = 1;

        //doggy matrix
        this.dawg = Mat4.translation(this.d_x, this.d_y, this.d_z);
        this.tree_L = Mat4.translation(this.t_lx, this.t_y, this.t_lz);
        this.tree_R = Mat4.translation(this.t_rx, this.t_y, this.t_rz);
        this.horizon = Mat4.translation(h_x, h_y, h_z);
        this.horizon_R = Mat4.translation((h_x + 28), h_y, h_z);
        this.horizon_L = Mat4.translation((h_x - 28), h_y, h_z);
        this.player = Mat4.translation(this.p_x,this.p_y,this.p_z);
        this.startingPage = Mat4.translation(0, 100, -12);


        let z = 30;
        let x_scale = 15;

        // Setup the surface scaling
        this.road.post_multiply(Mat4.scale(1.5, 1, z));
        this.side_R.post_multiply(Mat4.scale(x_scale, 1, z));
        this.side_L.post_multiply(Mat4.scale(x_scale, 1, z));
        this.player.post_multiply(Mat4.scale(0.25, 0.25, 0.25));

        this.horizon.post_multiply(Mat4.scale(14, 14, 1));
        this.horizon_R.post_multiply(Mat4.scale(14, 14, 1));
        this.horizon_L.post_multiply(Mat4.scale(14, 14, 1));
        this.startingPage.post_multiply(Mat4.scale(14, 14, 1));

        //Timer
        this.timer=0;
        this.record=0;

        //Sounds
        this.background_sound = new Audio("assets/racer.mp3");
        this.start_sound = new Audio("assets/car_start.mp3")
        this.accel_sound = new Audio("assets/accel.mp3");
        this.crash_sound = new Audio("assets/meow.mp3")

        //Game Starts
        this.start_game = 0;

    }
    background_music(){
        this.background_sound.play();
        this.background_sound.loop = true;
    }
    starting_game() {
        this.start_game = 1;
        this.start_sound.play();
    }
    accelerating(){
        this.is_accel=true;
        this.accel_sound.play();
    }

    getRandomDog(){
        let type=Math.random()*3;
        if (type < 1) {
            return this.materials.dawg1;
        } else if (type >=1 && type < 2) {
            return this.materials.dawg2;
        } else if (type >= 2) {
            return this.materials.dawg3;
        }
    }

    make_control_panel() {
        this.key_triggered_button("START", ["u"], () => this.starting_game());
        this.new_line();
        this.key_triggered_button("let us move", ["i"], () => this.accelerating(), undefined, () => this.is_accel = false);
        this.key_triggered_button("slowdown", ["k"], () => this.isdecel = true, undefined, () => this.isdecel = false);
        this.new_line();
        this.key_triggered_button("left", ["j"], () => this.is_L = true, undefined, () => this.is_L = false);
        this.key_triggered_button("right", ["l"], () => this.is_R = true, undefined, () => this.is_R = false);
        this.new_line();
        this.live_string(box => { box.textContent = "Timer: " + Math.round(this.timer) });
        this.new_line();
        this.live_string(box => { box.textContent = "Your record: " + Math.round(this.record) });
    }
    display(context, program_state) {

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.camera_matrix);

        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);


        // Directional Light to imitate sun
        const light_position = vec4(10, 10, 10, 0);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        // Time stuff
        let t = program_state.animation_time / 1000,
            dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();


        //When the Game Starts
        if(this.start_game === 0){
            const new_camera_location = this.camera_matrix.times(Mat4.translation(0,-96,0));
            program_state.set_camera(new_camera_location);
            this.background_music();
            this.shapes.startingPage.draw(context, program_state,this.startingPage , this.materials.startingPage);
            let text_location = Mat4.identity().times(Mat4.translation(-7,91,-9)).times(Mat4.scale(0.4,0.4,0.4));
            this.shapes.text.set_string('Press [u] to start racing!', context.context);
            this.shapes.text.draw(context, program_state, text_location, this.text_image);
        }
        else if(this.start_game === 1) {
            program_state.set_camera(this.camera_matrix);
            //Timer
            this.timer += this.materials.highway.velocity*dt;
            this.record = Math.max(this.record, this.timer);
            //Play BGM
            this.background_music();

            this.shapes.player.draw(context, program_state, this.player, this.materials.player);
            this.shapes.side_L.draw(context, program_state, this.side_L, this.materials.grass);
            this.shapes.side_R.draw(context, program_state, this.side_R, this.materials.grass);
            this.shapes.tree_L.draw(context, program_state, this.tree_L, this.materials.trees);
            this.shapes.tree_R.draw(context, program_state, this.tree_R, this.materials.trees);
            this.shapes.road.draw(context, program_state, this.road, this.materials.highway);
            this.shapes.horizon.draw(context, program_state, this.horizon, this.materials.horizon);
            this.shapes.horizon_R.draw(context, program_state, this.horizon_R, this.materials.horizon_R);
            this.shapes.horizon_L.draw(context, program_state, this.horizon_L, this.materials.horizon_L);
            this.shapes.dawg.draw(context, program_state, this.dawg, this.materials.dawg1);

            //Handle Movement
            this.move_player(this.is_R, this.is_L, this.m_spd, this.is_accel, this.isdecel, dt);
            this.move_dawg(this.d_spd);
            this.move_treeL(this.t_spd);
            this.move_treeR(this.t_spd);

            if(this.d_z ===-40){
                //Update random dog texture
                this.materials.dawg1 = this.getRandomDog();
                //Update random speed
                this.d_spd = random_numb(0.5,1.5);
            }
            //Handle collision
            this.check_if_died();


        } else
        {
            // HANDLE DEATH

            // END SCREEN STUFF
            const new_camera_location = this.camera_matrix.times(Mat4.translation(0,-96,0));
            program_state.set_camera(new_camera_location);
            this.shapes.startingPage.draw(context, program_state,this.startingPage , this.materials.endingPage);
            let text_location = Mat4.identity().times(Mat4.translation(-4.5,93,-9)).times(Mat4.scale(0.5,0.5,0.5));
            this.shapes.text.set_string('YOU CRASHED:(' , context.context);
            this.shapes.text.draw(context, program_state, text_location, this.text_image);
            text_location.post_multiply(Mat4.translation(-3,-2,0).times(Mat4.scale(0.7,0.7,0.7)));
            this.shapes.text.set_string('Press [u] to start again!' , context.context);
            this.shapes.text.draw(context, program_state, text_location, this.text_image);

            //RESET RELEVANT VARS

            // Dog restart
            this.d_x = 0;
            this.d_y = 0;
            this.d_z = -40;

            // Player Restart
            this.p_y = -0.25;
            this.p_x = 0;
            this.p_z = 1;

            // Score Restart Below
            this.timer=0;
        }
    }


    move_player(right, left, rate, is_move, is_slow, dt)
    {
        //Handle left-right
        if(right === true)
        {
            this.p_x += rate;
        }
        else if(left === true)
        {
            this.p_x -=rate;
        }
        if(this.p_x < -1.2)
            this.p_x = -1.2;
        if(this.p_x > 1.2)
            this.p_x = 1.2;

        //Handle front-back


        //Handle forward-backward
        if(is_move === true)
        {
            this.p_z -= (this.accel * dt);
            if(this.p_z < 1.0)
                this.p_z = 1;
        } else if (is_slow === true)
        {
            this.p_z += 2*(this.accel * dt);
            if(this.p_z > 4)
                this.p_z = 4;
        }
        else
        {
            this.p_z += (this.accel * dt);
            if(this.p_z > 4)
                this.p_z = 4;
        }


        //console.log(this.p_x, "   ", this.p_z)

        //Update the player
        this.player = Mat4.translation(this.p_x, this.p_y, this.p_z);
        this.player.post_multiply(Mat4.scale(0.25, 0.25, 0.25));


    }

    move_dawg(velocity)
    {
        this.d_z += velocity;

        if(this.d_z > 10)
        {
            this.d_z = -40;
            this.d_x = random_numb(-1.2, 1.2);

        }
        this.dawg = Mat4.translation(this.d_x, this.d_y, this.d_z);
        this.dawg.post_multiply(Mat4.scale(this.d_scl, this.d_scl, this.d_scl));

    }

    move_treeL(velocity)
    {
        this.t_lz += velocity;

        if(this.t_lz > 10)
        {
            this.t_lz = -40;
            this.t_lx = -3;

        }
        this.tree_L = Mat4.translation(this.t_lx, this.t_y, this.t_lz);
        this.tree_L.post_multiply(Mat4.scale(this.t_scl, this.t_scl, this.t_scl));

    }

    move_treeR(velocity)
    {
        this.t_rz += velocity;

        if(this.t_rz > 10)
        {
            this.t_rz = -50;
            this.t_rx = 3;

        }
        this.tree_R = Mat4.translation(this.t_rx, this.t_y, this.t_rz);
        this.tree_R.post_multiply(Mat4.scale(this.t_scl, this.t_scl, this.t_scl));

    }

    check_if_died()
    {
        console.log(this.p_z, "  ", this.d_z);
        //Check for intersections
        if
            (((this.p_x >= this.d_x - (this.d_scl / 2)) && (this.p_x <= this.d_x + (this.d_scl / 2))) &&
              (this.p_z <= this.d_z))
        {
            this.death()
        }

    }

    death() {
        this.crash_sound.play();
        this.background_sound.pause();
        this.start_game = 2;


    }



}

class Texture_Scroll_Y extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            uniform float velocity;
            
            float rate = 1.0;
            float change = -1.0 * rate * animation_time;
            vec2 tex_coord = vec2(1, change);

            vec3 black = vec3(0.0);
            
            
            void main(){
                // Sample the texture image in the correct place:
                 
                if( tex_coord.y > 10.0)
                    tex_coord.y = tex_coord.y - 10.0;
                 
                vec4 tex_color = texture2D( texture, f_tex_coord + tex_coord);  
                
                //important stuff
                 
                if( tex_color.w < .01 ) discard;            
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

