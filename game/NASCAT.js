import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class NASCAT extends Scene {

    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.shapes = {
            side_L: new Cube(),
            side_R: new Cube(),
            road: new Cube(),
            horizon: new Cube(),
            horizon_R: new Cube(),
            horizon_L: new Cube(),
            axis: new Axis_Arrows(),
            player: new Cube()
        }

        this.materials = {
            grass: new Material(new Texture_Scroll_Y(), {
                color: hex_color("#000000"),
                ambient: 0.7, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/sides.png", "LINEAR_MIPMAP_LINEAR"),
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
                texture: new Texture("assets/face_4.png", "LINEAR_MIPMAP_LINEAR"),
                velocity: 1.0
            })
        }
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.poop = 0;

        //player_pos variables
        this.p_y = -0.25;
        this.p_x = 0;
        this.p_z = 1;

        // sidetoside move_speed
        this.m_spd = 0.01;

        // back/forth movement speed
        this.accel = 1;


        //Movement booleans
        this.is_accel = false;
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

        this.horizon = Mat4.translation(h_x, h_y, h_z);
        this.horizon_R = Mat4.translation((h_x + 28), h_y, h_z);
        this.horizon_L = Mat4.translation((h_x - 28), h_y, h_z);
        this.player = Mat4.translation(this.p_x,this.p_y,this.p_z);



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

    }


    make_control_panel() {
        this.key_triggered_button("let us move", ["i"], () => this.is_accel = true, undefined, () => this.is_accel = false);
        this.new_line();
        this.key_triggered_button("left", ["j"], () => this.is_L = true, undefined, () => this.is_L = false);
        this.key_triggered_button("right", ["l"], () => this.is_R = true, undefined, () => this.is_R = false);

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

        //Handle Movement
        this.move_player(this.is_R, this.is_L, this.m_spd, this.is_accel, dt);

        //Draw all shapes
        this.shapes.player.draw(context, program_state, this.player, this.materials.player);
        this.shapes.side_L.draw(context, program_state, this.side_L, this.materials.grass);
        this.shapes.side_R.draw(context, program_state, this.side_R, this.materials.grass);
        this.shapes.road.draw(context, program_state, this.road, this.materials.highway);
        this.shapes.horizon.draw(context, program_state, this.horizon, this.materials.horizon);
        this.shapes.horizon_R.draw(context, program_state, this.horizon_R, this.materials.horizon_R);
        this.shapes.horizon_L.draw(context, program_state, this.horizon_L, this.materials.horizon_L);

    }


    move_player(right, left, rate, is_move, dt)
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
        } else
        {
            this.p_z += (this.accel * dt);
            if(this.p_z > 4)
                this.p_z = 4;
        }


        console.log(this.p_x, "   ", this.p_z)

        //Update the player
        this.player = Mat4.translation(this.p_x, this.p_y, this.p_z);
        this.player.post_multiply(Mat4.scale(0.25, 0.25, 0.25));


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

