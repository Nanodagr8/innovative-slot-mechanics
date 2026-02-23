# Uranus Spins - Engine Integration Pseudocode

Mapping deterministic RGS math events to high-fidelity visual feedback.

## 1. PixiJS (Javascript / Web)

```javascript
// Spine Actor Event Listener
spineObj.state.addListener({
  event: function (trackIndex, event) {
    switch (event.data.name) {
      case "on_fire":
        spawnBullet(spineObj.x, spineObj.y - 40);
        soundManager.play("LASER_SHOT");
        break;
      case "spawn_explosion_small":
        particleSystem.emit("EXPLODE", spineObj.x, spineObj.y);
        break;
      case "shake_small":
        camera.shake(450, 2); // 450ms, 2px amplitude
        break;
    }
  },
  complete: function (entry) {
    if (entry.animation.name === "death") {
      spineObj.visible = false;
      enemyPool.release(spineObj);
    }
  },
});
```

## 2. Unity (C#)

```csharp
public class SpineEventHandler : MonoBehaviour {
    public Spine.Unity.SkeletonAnimation skeletonAnim;
    public GameObject explosionPrefab;

    void Start() {
        skeletonAnim.AnimationState.Event += HandleEvent;
    }

    void HandleEvent(Spine.AnimationState state, Spine.Event e) {
        switch(e.Data.Name) {
            case "on_fire":
                SpawnProjectile();
                break;
            case "spawn_explosion_small":
                SpawnFX(explosionPrefab, skeletonAnim.transform.position);
                break;
            case "shake_small":
                CameraShake.Trigger(0.2f, 0.5f);
                break;
        }
    }
}
```

## 3. Math-to-Visual Loop

| Math Return          | Engine Action        | Spine Trigger                          |
| :------------------- | :------------------- | :------------------------------------- |
| `payout > threshold` | Start Celebration    | `skeleton.setAnimation("win", true)`   |
| `multiplier_up`      | Skin Swap            | `skeleton.setSkin("rage")`             |
| `reels_stop`         | Trigger Anticipation | `skeleton.setAnimation("tease", true)` |
