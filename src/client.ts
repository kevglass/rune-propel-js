import { physics } from "propel-js"
import { WorldIds } from "./examples/CarInteractive"

const canvas = document.getElementById("render") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
canvas.width = 500
canvas.height = 500

let left = false
let right = false
let lastSent = { left: false, right: false }
let lastSentTime = Date.now();

window.addEventListener("keydown", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") {
    left = true
  }
  if (e.key === "d" || e.key === "ArrowRight") {
    right = true
  }
})

window.addEventListener("keyup", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") {
    left = false
  }
  if (e.key === "d" || e.key === "ArrowRight") {
    right = false
  }
})

let world: physics.World
let ids: WorldIds

function render() {
  requestAnimationFrame(render)

  if (Date.now() - lastSentTime > 100) {
    if (lastSent.left !== left || lastSent.right !== right) {
      Dusk.actions.controls({ left, right })
      lastSent = { left, right }
      lastSentTime = Date.now()
    }
  }
  if (!world || !ids) {
    return
  }
  ctx.reset()
  ctx.resetTransform()
  ctx.lineWidth = 3

  ctx.clearRect(0, 0, 500, 500)

  const focusBody = world.dynamicBodies.find((b) => b.id === ids.chassis)
  if (focusBody) {
    ctx.translate(-(focusBody.center.x-250), -(focusBody.center.y-250));
  }
  const bodies = physics.allBodies(world)
  for (const joint of world.joints) {
    ctx.strokeStyle = "yellow"

    const bodyA = bodies.find((b) => b.id === joint.bodyA)!
    const centerA = joint.shapeA
      ? bodyA.shapes.find((s) => s.id === joint.shapeA)!.center
      : bodyA.center
    const bodyB = bodies.find((b) => b.id === joint.bodyB)!
    const centerB = joint.shapeB
      ? bodyB.shapes.find((s) => s.id === joint.shapeB)!.center
      : bodyB.center
    ctx.beginPath()
    ctx.moveTo(centerA.x, centerA.y)
    ctx.lineTo(centerB.x, centerB.y)
    ctx.stroke()
  }
  for (const body of bodies.sort(
    (a, b) => (a.static ? 0 : 1) - (b.static ? 0 : 1)
  )) {
    for (const shape of body.shapes) {
      ctx.strokeStyle = "white"
      ctx.setLineDash([])
      if (body.static) {
        ctx.strokeStyle = "grey"
      } else if (
        (body as physics.DynamicRigidBody).restingTime > world.restTime
      ) {
        ctx.strokeStyle = "green"
      }

      if (shape.sensor) {
        ctx.strokeStyle = "yellow"
        ctx.setLineDash([5, 3])
      }
      if (shape.type === physics.ShapeType.CIRCLE) {
        ctx.save()
        ctx.translate(shape.center.x, shape.center.y)
        ctx.rotate(body.angle)

        ctx.beginPath()
        ctx.arc(0, 0, shape.bounds, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, shape.bounds)
        ctx.stroke()

        if (shape.sensor && shape.sensorColliding) {
          ctx.fillStyle = "rgba(255,255,0,0.7)"
          ctx.beginPath()
          ctx.arc(0, 0, shape.bounds, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "yellow"
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(0, shape.bounds)
          ctx.fill()
        }

        ctx.restore()
      }
      if (shape.type === physics.ShapeType.RECTANGLE) {
        ctx.fillStyle = "rgba(255,255,0,0.7)"
        ctx.save()
        ctx.translate(shape.center.x, shape.center.y)
        ctx.rotate(body.angle + shape.angle)
        ctx.strokeRect(
          -shape.width / 2,
          -shape.height / 2,
          shape.width,
          shape.height
        )

        if (shape.sensor && shape.sensorColliding) {
          ctx.fillRect(
            -shape.width / 2,
            -shape.height / 2,
            shape.width,
            shape.height
          )
        }
        ctx.restore()
      }
    }

    if (!body.static) {
      const dynamic = body as physics.DynamicRigidBody
      ctx.fillStyle = "blue"
      ctx.beginPath()
      ctx.arc(
        dynamic.centerOfPhysics.x,
        dynamic.centerOfPhysics.y,
        2,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
    ctx.fillStyle = "red"
    ctx.beginPath()
    ctx.arc(body.center.x, body.center.y, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

requestAnimationFrame(render)
Dusk.initClient({
  onChange: ({ game }) => {
    world = game.world
    ids = game.ids
  },
})
