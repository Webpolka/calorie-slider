/*---------------------------------------------------------------------------------------------------------------------
Callorie calculator script
------------------------------------------------------------------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("calorieForm");
	const resultDiv = document.getElementById("calorie-results");
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		// Считываем данные из формы
		const gender = form.gender.value; // 'male' или 'female'
		const age = +form.age.value; // возраст, целое число
		const height = +form.height.value; // рост (см)
		const weight = +form.weight.value; // вес (кг)
		const activity = +form.lifestyle.value; // коэффициент активности
		const goal = form.goal.value; // 'loss', 'maintain' или 'gain'
		// 1) Базальный метаболизм (BMR)
		// Формула Харриса–Бенедикта
		const bmrHarris =
			gender === "male" ? 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age : 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
		// Формула Миффлина–Сан Жеора
		const bmrMifflin = 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
		// 2) Учёт образа жизни → TDEE
		const tdeeHarris = Math.round(bmrHarris * activity);
		const tdeeMifflin = Math.round(bmrMifflin * activity);
		// 3) Корректировка калорийности по цели
		const adjustments = {
			loss: { min: -500, max: -300 },
			maintain: { min: -100, max: 100 },
			gain: { min: 300, max: 500 },
		};
		const adj = adjustments[goal];
		function getRange(tdee) {
			return {
				min: Math.round(tdee + adj.min),
				max: Math.round(tdee + adj.max),
			};
		}
		const rangeMiddle = getRange((tdeeHarris + tdeeMifflin) / 2);
		const rangeH = getRange(tdeeHarris);
		const rangeM = getRange(tdeeMifflin);
		// 4) Распределение макронутриентов
		const macroRatios = {
			loss: { p: 0.3, f: 0.25, c: 0.45, t: "потери веса" },
			maintain: { p: 0.25, f: 0.3, c: 0.45, t: "удержания веса" },
			gain: { p: 0.25, f: 0.25, c: 0.5, t: "набора веса" },
		};
		const ratios = macroRatios[goal];
		function calcMacros(calories) {
			return {
				proteins: Math.round((calories * ratios.p) / 4), // 1 г белка = 4 ккал
				fats: Math.round((calories * ratios.f) / 9), // 1 г жира = 9 ккал
				carbs: Math.round((calories * ratios.c) / 4), // 1 г углеводов = 4 ккал
			};
		}

		// Берём среднее от всех четырёх границ для расчёта макро
		const avgCalories = Math.round((rangeH.min + rangeH.max + rangeM.min + rangeM.max) / 4);
		const macros = calcMacros(avgCalories);

		// 5) Вывод результатов
		resultDiv.innerHTML = `
	  <div class="calculation-result-inner">

		<h3>Расчет суточной нормы калорий :</h3>
		 <p>по Харрису–Бенедикту ${tdeeHarris} ккал/день</p>
		 <p>по Миффлину–Сан Жеора ${tdeeMifflin} ккал/день</p>

		 <h3>Рекомендации для ${ratios.t}</h3>		
		 <p>диапазон каллорий ${rangeMiddle.min}–${rangeMiddle.max} </p>
		 <p>суточная норма белков : ${macros.proteins} грамм</p>
		 <p>суточная норма жиров : ${macros.fats} грамм</p>
		<p>суточная норма углеводов : ${macros.carbs} грамм</p>
	  </div>`;

		// Скролл к элементу
		resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
	});

	// Сбрасываем результаты
	form.addEventListener("reset", (event) => {
		const resultDiv = document.getElementById("calorie-results");
		resultDiv.innerHTML = "";
	});

	// Ограничитель min/max в input
	const inputs = document.querySelectorAll('input[type="number"]');
	inputs.forEach((input) => {
		input.addEventListener("input", () => {
			const max = parseFloat(input.getAttribute("max"));
			let value = parseFloat(input.value);

			if (!isNaN(max) && !isNaN(value)) {
				if (value > max) {
					input.value = max; // Ограничение по max
				}
			}
		});

		input.addEventListener("keydown", (e) => {
			// Разрешенные клавиши:
			const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];

			// Проверка, если это цифра или запятая или точка
			const isNumber = e.key >= "0" && e.key <= "9";

			// Разрешаем, если клавиша есть в списке разрешенных или это разрешенная клавиша
			if (allowedKeys.includes(e.key) || isNumber) {
				// Можно оставить
				return;
			} else {
				e.preventDefault(); // блокируем все остальные символы
			}
		});
	});
});
