"use client"

import { useEffect, useRef, useCallback } from "react"

interface SmoothWavyCanvasProps {
    backgroundColor?: string
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    lineOpacity?: number
    animationSpeed?: number
}

const SmoothWavyCanvas = ({
    backgroundColor = "#F8F6F0",
    primaryColor = "45, 45, 45",
    secondaryColor = "80, 80, 80",
    accentColor = "120, 120, 120",
    lineOpacity = 1,
    animationSpeed = 0.004,
}: SmoothWavyCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const requestIdRef = useRef<number | null>(null)
    const timeRef = useRef<number>(0)
    const mouseRef = useRef({ x: 0, y: 0, isDown: false })

    const getMouseInfluence = (x: number, y: number): number => {
        const dx = x - mouseRef.current.x
        const dy = y - mouseRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 200
        return Math.max(0, 1 - distance / maxDistance)
    }

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        mouseRef.current.x = e.clientX - rect.left
        mouseRef.current.y = e.clientY - rect.top
    }, [])

    const handleMouseDown = useCallback(() => {
        mouseRef.current.isDown = true
        // Removed click effects - no more energy fields created
    }, [])

    const handleMouseUp = useCallback(() => {
        mouseRef.current.isDown = false
    }, [])

    const animate = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        timeRef.current += animationSpeed

        // Keep timeRef bounded to prevent overflow and maintain smooth looping
        // Use modulo with a large number (1000) to create seamless loops
        if (timeRef.current > 1000) {
            timeRef.current = timeRef.current % 1000
        }

        const width = canvas.width
        const height = canvas.height

        // Clear with clean background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)

        // Primary horizontal flowing lines
        const numPrimaryLines = 35

        for (let i = 0; i < numPrimaryLines; i++) {
            const yPos = (i / numPrimaryLines) * height
            const mouseInfl = getMouseInfluence(width / 2, yPos)

            const amplitude = 45 + 25 * Math.sin(timeRef.current * 0.25 + i * 0.15) + mouseInfl * 25
            const frequency = 0.006 + 0.002 * Math.sin(timeRef.current * 0.12 + i * 0.08) + mouseInfl * 0.001
            const speed = timeRef.current * (0.6 + 0.3 * Math.sin(i * 0.12)) + mouseInfl * timeRef.current * 0.3
            const thickness = 0.6 + 0.4 * Math.sin(timeRef.current + i * 0.25) + mouseInfl * 0.8
            const opacity =
                (0.12 + 0.08 * Math.abs(Math.sin(timeRef.current * 0.3 + i * 0.18)) + mouseInfl * 0.15) *
                lineOpacity

            ctx.beginPath()
            ctx.lineWidth = thickness
            ctx.strokeStyle = `rgba(${primaryColor}, ${opacity})`

            for (let x = 0; x < width; x += 2) {
                const localMouseInfl = getMouseInfluence(x, yPos)

                const y =
                    yPos +
                    amplitude * Math.sin(x * frequency + speed) +
                    localMouseInfl * Math.sin(timeRef.current * 2 + x * 0.008) * 15

                if (x === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            }

            ctx.stroke()
        }

        // Secondary vertical flowing lines
        const numSecondaryLines = 25

        for (let i = 0; i < numSecondaryLines; i++) {
            const xPos = (i / numSecondaryLines) * width
            const mouseInfl = getMouseInfluence(xPos, height / 2)

            const amplitude = 40 + 20 * Math.sin(timeRef.current * 0.18 + i * 0.14) + mouseInfl * 20
            const frequency = 0.007 + 0.003 * Math.cos(timeRef.current * 0.14 + i * 0.09) + mouseInfl * 0.002
            const speed = timeRef.current * (0.5 + 0.25 * Math.cos(i * 0.16)) + mouseInfl * timeRef.current * 0.25
            const thickness = 0.5 + 0.3 * Math.sin(timeRef.current + i * 0.35) + mouseInfl * 0.7
            const opacity =
                (0.1 + 0.06 * Math.abs(Math.sin(timeRef.current * 0.28 + i * 0.2)) + mouseInfl * 0.12) *
                lineOpacity

            ctx.beginPath()
            ctx.lineWidth = thickness
            ctx.strokeStyle = `rgba(${secondaryColor}, ${opacity})`

            for (let y = 0; y < height; y += 2) {
                const localMouseInfl = getMouseInfluence(xPos, y)

                const x =
                    xPos +
                    amplitude * Math.sin(y * frequency + speed) +
                    localMouseInfl * Math.sin(timeRef.current * 2 + y * 0.008) * 12

                if (y === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            }

            ctx.stroke()
        }

        // Accent diagonal flowing lines
        const numAccentLines = 15

        for (let i = 0; i < numAccentLines; i++) {
            const offset = (i / numAccentLines) * width * 1.5 - width * 0.25
            const amplitude = 30 + 15 * Math.cos(timeRef.current * 0.22 + i * 0.12)
            const phase = timeRef.current * (0.4 + 0.2 * Math.sin(i * 0.13))
            const thickness = 0.4 + 0.25 * Math.sin(timeRef.current + i * 0.28)
            const opacity = (0.06 + 0.04 * Math.abs(Math.sin(timeRef.current * 0.24 + i * 0.15))) * lineOpacity

            ctx.beginPath()
            ctx.lineWidth = thickness
            ctx.strokeStyle = `rgba(${accentColor}, ${opacity})`

            const steps = 100
            for (let j = 0; j <= steps; j++) {
                const progress = j / steps
                const baseX = offset + progress * width
                const baseY = progress * height + amplitude * Math.sin(progress * 6 + phase)

                const mouseInfl = getMouseInfluence(baseX, baseY)

                const x =
                    baseX +
                    mouseInfl * Math.sin(timeRef.current * 1.5 + progress * 6) * 8
                const y =
                    baseY +
                    mouseInfl * Math.cos(timeRef.current * 1.5 + progress * 6) * 8

                if (j === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            }

            ctx.stroke()
        }

        // No energy field effects - removed completely

        requestIdRef.current = requestAnimationFrame(animate)
    }, [backgroundColor, primaryColor, secondaryColor, accentColor, lineOpacity, animationSpeed])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        resizeCanvas()

        const handleResize = () => resizeCanvas()
        window.addEventListener("resize", handleResize)
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mouseup", handleMouseUp)

        animate()

        return () => {
            window.removeEventListener("resize", handleResize)
            canvas.removeEventListener("mousemove", handleMouseMove)
            canvas.removeEventListener("mousedown", handleMouseDown)
            canvas.removeEventListener("mouseup", handleMouseUp)

            if (requestIdRef.current) {
                cancelAnimationFrame(requestIdRef.current)
                requestIdRef.current = null
            }

            timeRef.current = 0
        }
    }, [animate, resizeCanvas, handleMouseMove, handleMouseDown, handleMouseUp])

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor }}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    )
}

export default SmoothWavyCanvas
