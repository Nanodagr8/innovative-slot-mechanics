# Uranus Spins - Animation Timing Specifications

All durations are in **milliseconds (ms)**.

## 1. Symbol Animations (Enemy A, B, C)

| Animation      | Duration | Easing           | Keyframes / Notes                                                                                                             |
| :------------- | :------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **idle_hover** | 1200ms   | easeInOutSine    | body Y: ±4px, 0ms(0) -> 300ms(+4) -> 600ms(0) -> 900ms(-4) -> 1200ms(0). Fin micro-rot: 600ms ±6º. Eye glow: 900ms 1.0->1.08. |
| **hit**        | 120ms    | linear / outQuad | alpha spike 100% -> 70% -> 100%, body squash (X: 105% @30ms, Y: 85% @30ms, recover @60ms).                                    |
| **death**      | 450ms    | easeOutQuad      | 0-120ms: scale 1.0->1.25. 140ms: event `spawn_explosion_small`. 120-300ms: part separation. 300-450ms: fade out.              |

## 2. Player Ship

| Animation      | Duration | Easing        | Notes                                                                                       |
| :------------- | :------- | :------------ | :------------------------------------------------------------------------------------------ |
| **idle_hover** | 1200ms   | easeInOutSine | Amplitude ±6px (hero presence).                                                             |
| **fire_loop**  | 200ms    | easeInOutSine | Repeatable. Engine pulse 90% -> 120%. Gun recoil 40ms back, 120ms return. Event: `on_fire`. |

## 3. Boss (Multi-Phase)

| Animation        | Duration | Easing         | Notes                                                             |
| :--------------- | :------- | :------------- | :---------------------------------------------------------------- |
| **idle_breathe** | 1600ms   | easeInOutSine  | core_scale 1.0 -> 1.12 -> 1.0. Shield ring rotate 360/3200ms.     |
| **attack_L/R**   | 900ms    | easeIn/OutQuad | 0-300ms windup (rotate+glow), 320ms fire event, 320-900ms settle. |

## 4. UI & Celebrations

| Element              | Duration | Easing      | Hook / Notes                                                      |
| :------------------- | :------- | :---------- | :---------------------------------------------------------------- |
| **button_press**     | 160ms    | easeOutBack | 93% scale @ 30ms, recovery with small overshoot.                  |
| **big_win**          | 2200ms   | easeOutBack | Intro (600ms) -> Hold (1000ms) -> Out (600ms).                    |
| **FS_intro**         | 1700ms   | easeOutBack | Title zoom 0-500ms, ring rotate active particles burst 350-700ms. |
| **last_reel_teaser** | 480ms    | easeOutSine | Pulse brightness 0->100% @120ms, decay to 60%.                    |

## 5. FX Skeletons (Spine)

| Animation          | Duration | Easing        | Description                                    |
| :----------------- | :------- | :------------ | :--------------------------------------------- |
| **hit_small**      | 160ms    | easeOutQuad   | Ring scale 0.6->1.1, alpha fade 60-160ms.      |
| **explode_small**  | 420ms    | easeOutQuad   | Core (0-80), Shards (80-260), Smoke (260-420). |
| **win_ring_pulse** | 700ms    | easeInOutSine | Scale 0.9->1.12->0.98. Additive alpha pulse.   |
