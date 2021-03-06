import {PersonFactory} from './../PersonFactory.js';

export class BulletAdministrator {
	static BULLET_PISTOL = "bulletPistol";
	static BULLET_RPG = "bulletRpg";
	
	constructor(params) {
		this.ADMINISTRATOR = params.administrator;
		this.world = params.world;
		this.scene = params.scene;
		this.bullets = [];
		this.deletedBullets = [];
		this.bullet;
	}
	
	buildNewBullet(entity, direction) {
		var position = entity.body.position;
		if(this.ADMINISTRATOR.gameEnable==false) return;
		var bullet = this.createNewBullet(entity.person.getActualWeapon().bullet);
		bullet.body.addEventListener("collide", function (e){
                if ( !(e.contact.bi.isGround || e.contact.bj.isGround) )
                    return;
                bullet.body.isBullet = undefined;
				this.deletedBullets.push(bullet)
            }.bind(this));
		if(entity.person.typeFlag == 'player'){
			var x = position.x;
			var y = position.y+1.8;
			var z = position.z;
			bullet.body.isBullet = 1;
		}

		if(entity.person.typeFlag == 'giant'){
			var x = position.x;
			var y = position.y+2;
			var z = position.z;
			bullet.body.isBullet = 2;
		}

		if(entity.person.typeFlag == 'small'){
			var x = position.x;
			var y = position.y+0.5;
			var z = position.z;
			bullet.body.isBullet = 2;
		}
		
		this.bullets.push(bullet);
		
		bullet.body.velocity.set(  direction.x * bullet.velocity,
								direction.y * bullet.velocity,
								direction.z * bullet.velocity);


		var radiusDistance = entity.body.shapes[0].radius*1.02 + bullet.shape.radius;
		x += direction.x * (radiusDistance);
		y += direction.y * (radiusDistance);
		z += direction.z * (radiusDistance);
		bullet.body.position.set(x,y,z);
		bullet.mesh.position.set(x,y,z);
		this.world.add(bullet.body);
		this.scene.add(bullet.mesh);
	}
	
	createNewBullet(bullet) {
		var bulletBody = new CANNON.Body({mass: bullet.mass});
		var bulletShape = new CANNON.Sphere(bullet.radius);
		var ballGeometry = new THREE.SphereGeometry(bullet.radius, 32, 32);
		var randomColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
		var material2 = new THREE.MeshPhongMaterial( { color: randomColor } );
		var shootSpeed = bullet.shootSpeed;
		var bulletMesh = new THREE.Mesh( ballGeometry, material2 );
		bulletBody.addShape(bulletShape);
		bulletMesh.castShadow = true;
		bulletMesh.receiveShadow = true;
		return {body: bulletBody, mesh: bulletMesh, shape: bulletShape, velocity: shootSpeed, pos: this.bullets.length}
	}
	
	update(timeInMilliSecond) {
		for(let i in this.deletedBullets) {
			var bullet = this.deletedBullets[i]
			this.world.remove(bullet.body);
			bullet.mesh.parent.remove(bullet.mesh);
			var pos = bullet.pos;
			this.bullets.splice(pos, 1);
			for (let j = pos; j < this.bullets.length; j++)
				this.bullets[j].pos -= 1;
		}
		this.deletedBullets = [];
		for(let i in this.bullets) {
			var bullet = this.bullets[i];
			bullet.mesh.position.copy(bullet.body.position);
			bullet.mesh.quaternion.copy(bullet.body.quaternion);
		}
	}
}

