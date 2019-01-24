var circleBody2 = new Array(); // массив шариков
var num = 50; // общее кол-во частиц

function drawDynamicSystem(canvas, slider_g, text_g, slider_min_V, text_min_V, slider_max_V, text_max_V, slider_particles_num, text_particles_num) {
	var canvas, ctx, w, h, world, lineBody, lineBody1, s, s1; // переменные: канвас, содержимое канваса, ширина и высота канваса, создание "мира" p2, парвая и левая "стена", пружины для связи со стенами 
	var circleShape2 = new Array(); // массив форм шариков
	var ss = new Array(); // массив пружин
	var k = 250; // жесткость пружин
	var B = 0; // вязкость
	var mass = 0.5 // масса шариков
	var R = 0.05; // радиус шаров
	var dx = 0.01; // начальная длина пружин
	var g = 0; // сила тяжести
	var minV = -5; // минимальная начальная скорость
	var maxV = 5; // максимальная начальная скорость
	var particles_num = num;

	var sw = 0; // переключатель для кнопок

	// Инициализируем канвал и действия маши 
	canvas = document.getElementById("myCanvas");
	w = canvas.width;
	h = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;

	// Ползунки и текстовые поля	
	this.setSlider_g = function (new_g) {
		g = new_g;
		world.gravity[1] = -g;
	};

	this.setSlider_min_V = function (new_min_V) {
		minV = parseFloat(new_min_V);
	};

	this.setSlider_max_V = function (new_max_V) {
		maxV = parseFloat(new_max_V);
	};

	this.setSlider_particles_num = function (new_particles_num) {
		particles_num = parseInt(new_particles_num, 10);
	};

	this.setSlider_B = function (new_B) {
		B = new_B * 12;
		s.damping = B;
		s1.damping = B;

		for (var i = 0; i < num - 1; i++) {
			ss[i].damping = B;
		}

		for (var j = 0; j < num; j++) {
			circleBody2[j].damping = B / 24;
		}
	};

	slider_g.min = 0;
	slider_g.max = 1;
	slider_g.step = 0.10;
	slider_g.value = g;
	text_g.value = g.toFixed(1);

	slider_min_V.min = -10;
	slider_min_V.max = 0;
	slider_min_V.step = 0.10;
	slider_min_V.value = minV;
	text_min_V.value = minV.toFixed(1);

	slider_max_V.min = 0;
	slider_max_V.max = 10;
	slider_max_V.step = 0.10;
	slider_max_V.value = maxV;
	text_max_V.value = maxV.toFixed(1);

	slider_particles_num.min = 2;
	slider_particles_num.max = 100;
	slider_particles_num.step = 1;
	slider_particles_num.value = particles_num;
	text_particles_num.value = particles_num.toFixed(1);

	slider_B.min = 0;
	slider_B.max = 1;
	slider_B.step = 0.10;
	slider_B.value = B / 12;
	text_B.value = (B / 12).toFixed(1);

	init();
	animate();

	// Функция "переключения" кнопок 
	this.sw = function (a) {
		sw = a;
	}

	// Функция сброса 
	function Reset() {
		num = particles_num;
		sw = 0;
		world.clear();
		init();
	}

	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
	}

	// Функция создания всех объектов 
	function init() {
		// Создание мира p2
		world = new p2.World();
		world.gravity[1] = -g;
		world.solver.iterations = 10;
		world.solver.frictionIterations = 0;

		// Создаем левую границу
		lineShape = new p2.Line({ length: 6 });
		lineBody = new p2.Body({
			position: [-6, -4],
			angle: Math.PI / 2
		});
		lineBody.addShape(lineShape, [0, 0], Math.PI);
		world.addBody(lineBody);

		// Создаем правую границу
		lineShape1 = new p2.Line({ length: 6 });
		lineBody1 = new p2.Body({
			position: [6, -4],
			angle: Math.PI / 2
		});
		lineBody1.addShape(lineShape1, [0, 0], Math.PI);
		world.addBody(lineBody1);

		// Создаем все шарики
		for (var i = 0; i < num; i++) {
			circleShape2[i] = new p2.Circle({ radius: R });
			circleBody2[i] = new p2.Body({ mass: mass, position: [(-6 + (12 * (i + 1) / (num + 1))), 0], angularDamping: 0, damping: B / 24, velocity: [0, getRandom(minV, maxV)] });
			circleBody2[i].addShape(circleShape2[i]);
			world.addBody(circleBody2[i]);
		};

		//Создаем пружину для связи с левой границей
		s = new p2.LinearSpring(circleBody2[0], lineBody, {
			restLength: dx,
			stiffness: k,
			damping: B,
			localAnchorB: [4, 0],
		});
		world.addSpring(s);

		// Создаем пружину для связи с правой границей
		s1 = new p2.LinearSpring(circleBody2[num - 1], lineBody1, {
			restLength: dx,
			stiffness: k,
			damping: B,
			localAnchorB: [4, 0],
		});
		world.addSpring(s1);

		// Создаем пружины для связи шариков вместе
		for (var i = 0; i < num - 1; i++) {
			ss[i] = new p2.LinearSpring(circleBody2[i], circleBody2[i + 1], {
				restLength: dx,
				stiffness: k,
				damping: B,
				localAnchorA: [0, 0],
				localAnchorB: [0, 0],
			});
			world.addSpring(ss[i]);
		};

		//Отключаем взаимодействие между пружинами и между шариками
		for (var i = 0; i < num - 1; i++) {
			for (var j = i; j < num - 1; j++) {
				world.disableBodyCollision(ss[i], ss[j]);
			}
		};

		for (var i = 0; i < num; i++) {
			for (var j = i; j < num; j++) {
				world.disableBodyCollision(circleBody2[i], circleBody2[j]);
				world.disableBodyCollision(circleBody2[i], lineBody1);
				world.disableBodyCollision(circleBody2[i], lineBody);
			}
		};
	}

	// Функция рисования всех шаров 
	function drawAllCircle() {
		for (var i = 0; i < num; i++) {
			ctx.beginPath();

			var x1 = circleBody2[i].position[0];
			var y1 = circleBody2[i].position[1];
			var radius1 = circleShape2[i].radius;

			ctx.arc(x1, y1, radius1, 0, 2 * Math.PI);
			ctx.fill();
			ctx.strokeStyle = "red";
			ctx.stroke();
		}
	}

	// Рисуем правую стену
	function drawRL() {
		ctx.beginPath();

		var x = lineBody.position[0];
		var y = lineBody.position[1];

		ctx.moveTo(x, -y);
		ctx.lineTo(x, y);
		ctx.strokeStyle = "black";
		ctx.stroke();
	}

	// Рисуем левую стену
	function drawLL() {
		ctx.beginPath();

		var x = lineBody1.position[0];
		var y = lineBody1.position[1];

		ctx.moveTo(x, -y);
		ctx.lineTo(x, y);
		ctx.strokeStyle = "black";
		ctx.stroke();
	}

	// Рисуем все пружины
	function drawAllSpring() {
		for (var i = 0; i < num - 1; i++) {
			ctx.beginPath();

			var x = circleBody2[i].position[0];
			var y = circleBody2[i].position[1];

			var x1 = circleBody2[i + 1].position[0];
			var y1 = circleBody2[i + 1].position[1];

			ctx.moveTo(x, y);
			ctx.lineTo(x1, y1);

			ctx.strokeStyle = "red";
			ctx.stroke();
		}
	}

	// Рисуем пружину для связи первого шарика со стеной
	function draw1S() {
		ctx.beginPath();

		var x = circleBody2[0].position[0];
		var y = circleBody2[0].position[1];

		ctx.moveTo(-6, (s.localAnchorB[0] - 4));
		ctx.lineTo(x, y);
		ctx.strokeStyle = "red";
		ctx.stroke();
	}

	// Рисуем пружину для связи последнего шарика со стеной
	function draw2S() {
		ctx.beginPath();

		var x = circleBody2[num - 1].position[0];
		var y = circleBody2[num - 1].position[1];

		ctx.moveTo(6, 0);
		ctx.lineTo(x, y);
		ctx.strokeStyle = "red";
		ctx.stroke();
	}

	function render() {
		ctx.clearRect(0, 0, w, h);
		ctx.save();

		// Переводим начало в центр
		ctx.translate(w / 2, h / 2);

		//Зумируем канвас
		ctx.scale(50, -50);

		// Рисуем все тела на канвасе
		drawAllCircle();
		drawRL();
		drawLL();
		drawAllSpring();
		draw1S();
		draw2S();

		ctx.restore();
	}

	function animate() {
		requestAnimationFrame(animate);

		if (sw == -1) {
			Reset();
		}

		world.step((2 * Math.PI / Math.sqrt(k / mass)) / 100);

		render();
	}

}

function getEnergyX() {
	var Ex = 0;

	for (var i = 0; i < num; i++) {
		Ex += 0.5 * circleBody2[i].mass * Math.pow(circleBody2[i].velocity[0].toFixed(3), 2);
	}

	return Ex;
}

function getEnergyY() {
	var Ey = 0;

	for (var i = 0; i < num; i++) {
		Ey += 0.5 * circleBody2[i].mass * Math.pow(circleBody2[i].velocity[1].toFixed(3), 2);
	}

	return Ey;
}