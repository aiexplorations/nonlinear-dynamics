// Simple OrbitControls implementation
class SimpleOrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        this.enabled = true;
        this.target = new THREE.Vector3();
        
        this.minDistance = 0;
        this.maxDistance = Infinity;
        
        this.enableZoom = true;
        this.zoomSpeed = 1.0;
        
        this.enableRotate = true;
        this.rotateSpeed = 1.0;
        
        this.enablePan = true;
        this.panSpeed = 1.0;
        
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        
        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateUp = this.rotateUp.bind(this);
        this.panLeft = this.panLeft.bind(this);
        this.panUp = this.panUp.bind(this);
        this.pan = this.pan.bind(this);
        this.dollyIn = this.dollyIn.bind(this);
        this.dollyOut = this.dollyOut.bind(this);
        this.update = this.update.bind(this);
        
        this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this));
        this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
        
        this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
        
        this.state = -1;
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        
        this.scale = 1;
        this.panOffset = new THREE.Vector3();
        
        this.update();
    }
    
    onContextMenu(event) {
        event.preventDefault();
    }
    
    onPointerDown(event) {
        if (!this.enabled) return;
        
        switch (event.pointerType) {
            case 'mouse':
                switch (event.button) {
                    case 0:
                        this.state = 1;
                        break;
                    case 2:
                        this.state = 2;
                        break;
                }
                break;
            case 'touch':
                this.state = 1;
                break;
        }
        
        if (this.state !== -1) {
            this.domElement.setPointerCapture(event.pointerId);
        }
    }
    
    onPointerMove(event) {
        if (!this.enabled) return;
        
        const rect = this.domElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.state === 1) {
            if (this.enableRotate) {
                this.rotateLeft(2 * Math.PI * (x - this.mouseX) / this.domElement.clientWidth * this.rotateSpeed);
                this.rotateUp(2 * Math.PI * (y - this.mouseY) / this.domElement.clientHeight * this.rotateSpeed);
            }
        } else if (this.state === 2) {
            if (this.enablePan) {
                this.pan(x - this.mouseX, y - this.mouseY);
            }
        }
        
        this.mouseX = x;
        this.mouseY = y;
    }
    
    onPointerUp(event) {
        if (!this.enabled) return;
        this.state = -1;
        this.domElement.releasePointerCapture(event.pointerId);
    }
    
    onMouseWheel(event) {
        if (!this.enabled || !this.enableZoom) return;
        
        event.preventDefault();
        
        if (event.deltaY < 0) {
            this.dollyOut();
        } else {
            this.dollyIn();
        }
    }
    
    onTouchStart(event) {
        if (!this.enabled) return;
        this.state = 1;
    }
    
    onTouchEnd(event) {
        if (!this.enabled) return;
        this.state = -1;
    }
    
    onTouchMove(event) {
        if (!this.enabled) return;
        event.preventDefault();
        
        const rect = this.domElement.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;
        
        if (this.state === 1) {
            if (this.enableRotate) {
                this.rotateLeft(2 * Math.PI * (x - this.mouseX) / this.domElement.clientWidth * this.rotateSpeed);
                this.rotateUp(2 * Math.PI * (y - this.mouseY) / this.domElement.clientHeight * this.rotateSpeed);
            }
        }
        
        this.mouseX = x;
        this.mouseY = y;
    }
    
    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }
    
    rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }
    
    panLeft(distance) {
        const panOffset = new THREE.Vector3();
        const te = this.camera.matrix.elements;
        panOffset.set(te[0], te[1], te[2]);
        panOffset.multiplyScalar(-distance);
        this.panOffset.add(panOffset);
    }
    
    panUp(distance) {
        const panOffset = new THREE.Vector3();
        const te = this.camera.matrix.elements;
        panOffset.set(te[4], te[5], te[6]);
        panOffset.multiplyScalar(distance);
        this.panOffset.add(panOffset);
    }
    
    pan(deltaX, deltaY) {
        const element = this.domElement;
        const offset = new THREE.Vector3();
        const position = this.camera.position;
        offset.copy(position).sub(this.target);
        let targetDistance = offset.length();
        targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
        const distance = 2 * deltaX * targetDistance / element.clientHeight;
        this.panLeft(distance);
        const distance2 = 2 * deltaY * targetDistance / element.clientHeight;
        this.panUp(distance2);
    }
    
    dollyIn() {
        this.scale /= 1.1;
    }
    
    dollyOut() {
        this.scale *= 1.1;
    }
    
    update() {
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        
        this.spherical.setFromVector3(offset);
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        this.spherical.phi = Math.max(0.000001, Math.min(Math.PI - 0.000001, this.spherical.phi));
        this.spherical.radius *= this.scale;
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
        
        offset.setFromSpherical(this.spherical);
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);
        
        if (this.enableDamping) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
        }
        
        this.scale = 1;
        this.panOffset.multiplyScalar(1 - this.dampingFactor);
        this.target.add(this.panOffset);
    }
    
    reset() {
        this.target.set(0, 0, 0);
        this.camera.position.set(50, 50, 50);
        this.camera.lookAt(this.target);
        this.sphericalDelta.set(0, 0, 0);
        this.panOffset.set(0, 0, 0);
        this.scale = 1;
    }
}

class DynamicalSystemsVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.trajectory = null;
        this.points = [];
        this.currentSystem = 'lorenz';
        this.parameters = {
            lorenz: { sigma: 10, rho: 28, beta: 8/3 },
            rossler: { a: 0.2, b: 0.2, c: 5.7 },
            chua: { alpha: 15.6, beta: 28, m0: -1.143, m1: -0.714 },
            chen: { a: 35, b: 3, c: 28 }
        };
        
        this.init();
        this.setupEventListeners();
        this.updateParameterControls();
        this.generateTrajectory();
    }
    
    init() {
        try {
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x1a1a1a);
            
            // Camera setup
            this.camera = new THREE.PerspectiveCamera(
                75, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                1000
            );
            this.camera.position.set(50, 50, 50);
            
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: document.getElementById('canvas'),
                antialias: true 
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
            // Controls setup
            this.controls = new SimpleOrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(50, 50, 50);
            this.scene.add(directionalLight);
            
            // Grid helper
            const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
            this.scene.add(gridHelper);
            
            // Axes helper
            const axesHelper = new THREE.AxesHelper(20);
            this.scene.add(axesHelper);
            
            // Hide loading indicator
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            this.animate();
            
        } catch (error) {
            console.error('Error initializing Three.js:', error);
            document.getElementById('container').innerHTML = 
                '<div style="color: white; text-align: center; padding: 50px;">Error initializing 3D visualization: ' + error.message + '</div>';
        }
    }
    
    setupEventListeners() {
        // System selection
        document.getElementById('system').addEventListener('change', (e) => {
            this.currentSystem = e.target.value;
            this.updateParameterControls();
            this.generateTrajectory();
        });
        
        // Update button
        document.getElementById('update').addEventListener('click', () => {
            this.updateParameters();
            this.generateTrajectory();
        });
        
        // Reset camera button
        document.getElementById('reset').addEventListener('click', () => {
            this.camera.position.set(50, 50, 50);
            this.controls.reset();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    updateParameterControls() {
        const paramsContainer = document.getElementById('params');
        paramsContainer.innerHTML = '';
        
        const systemParams = this.parameters[this.currentSystem];
        
        Object.keys(systemParams).forEach(param => {
            const paramGroup = document.createElement('div');
            paramGroup.className = 'param-group';
            
            const label = document.createElement('label');
            label.textContent = param;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.1';
            input.value = systemParams[param];
            input.dataset.param = param;
            
            paramGroup.appendChild(label);
            paramGroup.appendChild(input);
            paramsContainer.appendChild(paramGroup);
        });
    }
    
    updateParameters() {
        const inputs = document.querySelectorAll('#params input');
        inputs.forEach(input => {
            const param = input.dataset.param;
            this.parameters[this.currentSystem][param] = parseFloat(input.value);
        });
    }
    
    generateTrajectory() {
        try {
            // Remove existing trajectory
            if (this.trajectory) {
                this.scene.remove(this.trajectory);
            }
            
            // Generate new trajectory
            const points = this.computeTrajectory();
            this.points = points;
            
            // Create geometry
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(points.length * 3);
            
            for (let i = 0; i < points.length; i++) {
                positions[i * 3] = points[i].x;
                positions[i * 3 + 1] = points[i].y;
                positions[i * 3 + 2] = points[i].z;
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            // Create material with gradient color
            const material = new THREE.LineBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.8
            });
            
            // Create line
            this.trajectory = new THREE.Line(geometry, material);
            this.scene.add(this.trajectory);
            
            // Update stats
            this.updateStats();
            
        } catch (error) {
            console.error('Error generating trajectory:', error);
        }
    }
    
    computeTrajectory() {
        const params = this.parameters[this.currentSystem];
        const dt = 0.01;
        const steps = 10000;
        const points = [];
        
        let x = 1, y = 1, z = 1; // Initial conditions
        
        for (let i = 0; i < steps; i++) {
            points.push({ x, y, z });
            
            let dx, dy, dz;
            
            switch (this.currentSystem) {
                case 'lorenz':
                    dx = params.sigma * (y - x);
                    dy = x * (params.rho - z) - y;
                    dz = x * y - params.beta * z;
                    break;
                    
                case 'rossler':
                    dx = -y - z;
                    dy = x + params.a * y;
                    dz = params.b + z * (x - params.c);
                    break;
                    
                case 'chua':
                    const h = params.m1 * x + 0.5 * (params.m0 - params.m1) * 
                             (Math.abs(x + 1) - Math.abs(x - 1));
                    dx = params.alpha * (y - x - h);
                    dy = x - y + z;
                    dz = -params.beta * y;
                    break;
                    
                case 'chen':
                    dx = params.a * (y - x);
                    dy = (params.c - params.a) * x - x * z + params.c * y;
                    dz = x * y - params.b * z;
                    break;
                    
                default:
                    dx = dy = dz = 0;
            }
            
            x += dx * dt;
            y += dy * dt;
            z += dz * dt;
        }
        
        return points;
    }
    
    updateStats() {
        const stats = document.getElementById('stats');
        stats.innerHTML = `
            System: ${this.currentSystem}<br>
            Points: ${this.points.length}<br>
            FPS: ${Math.round(1000 / this.deltaTime)}
        `;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = performance.now();
        this.deltaTime = time - (this.lastTime || time);
        this.lastTime = time;
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DynamicalSystemsVisualizer();
}); 