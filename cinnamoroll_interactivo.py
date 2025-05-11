import turtle
import time
import tkinter as tk
from tkinter import ttk

# Clase principal para la aplicación
class CinnamorollApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Cartita Jenni")
        self.root.geometry("800x700")
        self.root.configure(bg="#f9f0ff")
        
        # Configurar el frame principal
        self.main_frame = ttk.Frame(root)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Título
        self.title_label = tk.Label(
            self.main_frame, 
            text="Cartita Jenni", 
            font=("Comic Sans MS", 28, "bold"),
            fg="#ff6b9d",
            bg="#f9f0ff"
        )
        self.title_label.pack(pady=10)
        
        # Canvas para el dibujo de Turtle
        self.canvas = tk.Canvas(self.main_frame, width=600, height=500, bg="pink")
        self.canvas.pack(pady=10)
        
        # Frame para controles
        self.control_frame = ttk.Frame(self.main_frame)
        self.control_frame.pack(fill=tk.X, pady=10)
        
        # Botón para iniciar el dibujo
        self.start_button = tk.Button(
            self.control_frame,
            text="Sorpresa",
            command=self.iniciar_dibujo,
            bg="#ff9eb5",
            fg="white",
            font=("Comic Sans MS", 14, "bold"),
            padx=30,
            pady=15,
            relief=tk.RAISED,
            borderwidth=3
        )
        self.start_button.pack(side=tk.LEFT, padx=10)
        
        # Etiqueta para mostrar el progreso
        self.progress_label = tk.Label(
            self.main_frame,
            text="Listo para dibujar",
            font=("Arial", 12),
            fg="#5ba3e6",
            bg="#f9f0ff"
        )
        self.progress_label.pack(pady=10)
        
        # Configurar Turtle
        self.screen = turtle.TurtleScreen(self.canvas)
        self.screen.bgcolor("pink")
        self.t = turtle.RawTurtle(self.screen)
        self.t.hideturtle()
        self.t.speed(0)  # La velocidad más rápida para la configuración inicial
        
        # Estilo para los botones
        style = ttk.Style()
        style.configure("TButton", font=("Arial", 12, "bold"), padding=10)
        
    def go(self, x, y):
        """Función para mover la tortuga sin dibujar"""
        self.t.penup()
        self.t.goto(x, y)
        self.t.pendown()
        
    def actualizar_progreso(self, mensaje):
        """Actualiza la etiqueta de progreso"""
        self.progress_label.config(text=mensaje)
        self.root.update()
        
    def reiniciar(self):
        """Reinicia el canvas y la tortuga"""
        self.t.clear()
        self.t.penup()
        self.t.home()
        self.t.pendown()
        self.actualizar_progreso("Listo para dibujar")
        self.start_button.config(state=tk.NORMAL)
        
    def arco(self, direc, radio, ang):
        """Función para dibujar un arco"""
        self.t.seth(direc)
        self.t.circle(radio, ang)
        
    def linea(self, direc, longitud):
        """Función para dibujar una línea"""
        self.t.seth(direc)
        self.t.forward(longitud)
        
    def iniciar_dibujo(self):
        """Inicia el proceso de dibujo"""
        self.start_button.config(state=tk.DISABLED)
        self.t.clear()
        self.t.speed(0)  # Velocidad máxima
        
        # Comenzar a dibujar - primero los elementos decorativos
        self.dibujar_elementos_decorativos()
        # Luego dibujar a Cinnamoroll
        self.dibujar_cinnamoroll()
        
    def dibujar_cinnamoroll(self):
        """Dibuja a Cinnamoroll paso a paso"""
        # Configuración inicial
        self.t.pensize(4)
        self.t.pencolor("black")
        self.t.fillcolor("white")
        
        # Dibujar el cuerpo principal
        self.actualizar_progreso("Dibujando el cuerpo principal...")
        self.go(90.36, 50.50)
        self.t.begin_fill()
        self.t.seth(335.48)
        self.t.circle(184.32, 49.04)
        self.t.seth(29.62)
        self.t.circle(43.20, 85.3)
        self.t.seth(120.63)
        self.t.circle(52.95, 94.33)
        self.t.seth(209.57)
        self.t.circle(-104.61, 54.85)
        self.t.seth(160.45)
        self.t.circle(49.63, 68.51)
        self.t.seth(160.38)
        self.t.circle(123.19, 66.97)
        self.t.seth(175.54)
        self.t.circle(51.51, 59.01)
        self.t.seth(234.55)
        self.t.circle(-193.42, 30.71)
        self.t.seth(190.87)
        self.t.circle(65.22, 29.81)
        self.t.seth(238.45)
        self.t.circle(40.72, 121.52)
        self.t.seth(0.63)
        self.t.circle(108.89, 66.86)
        self.t.seth(293.19)
        self.t.circle(63.23, 7.9)
        self.t.seth(310.94)
        self.t.circle(38.76, 38.84)
        self.t.seth(357.3)
        self.t.circle(394.86, 24.1)
        self.t.seth(19.1)
        self.t.circle(48.19, 58.73)
        self.t.seth(90)
        self.t.circle(50.57, 61.76)
        self.t.end_fill()
        
        # Dibujar detalles del cuerpo
        self.actualizar_progreso("Añadiendo detalles del cuerpo...")
        self.go(52.48, 97.04)
        self.t.seth(151.45)
        self.t.circle(123.192, 83.7)
        
        self.go(-114.54, 34.24)
        self.t.seth(238.9)
        self.t.circle(63.23, 62.2)
        
        self.go(0, 0)
        self.t.seth(284.57)
        self.t.circle(-3.94, 141.58)
        self.t.seth(155.93)
        self.t.circle(19.37, 74.76)
        self.t.seth(216.84)
        self.t.circle(-5.73, 111.73)
        
        # Dibujar ojos
        self.actualizar_progreso("Dibujando los ojos...")
        self.t.pensize(6)
        self.t.pencolor("DeepSkyBlue")
        self.t.fillcolor("DeepSkyBlue")
        self.t.pensize(4)
        
        self.go(55.06, 23.35)
        self.t.seth(168.87)
        self.t.circle(34.23, 41.37)
        self.t.seth(57.66)
        self.t.circle(-44.08,36.45)
        
        self.go(-71.49, -3.85)
        self.t.begin_fill()
        self.t.seth(70.71)
        self.t.circle(20.48, 72.59)
        self.t.seth(153.37)
        self.t.circle(5.41, 71.85)
        self.t.seth(225.22)
        self.t.circle(18.29, 89.94)
        self.t.seth(320.4)
        self.t.circle(8.39, 110.31)
        self.t.end_fill()
        
        # Dibujar mejillas
        self.actualizar_progreso("Dibujando las mejillas...")
        self.t.pencolor("LightPink")
        self.t.fillcolor("LightPink")
        
        self.go(55.30, -8.89)
        self.t.begin_fill()
        self.t.seth(356.76)
        self.t.circle(35.78, 49.23)
        self.t.seth(61.68)
        self.t.circle(10.85, 71.8)
        self.t.seth(149.39)
        self.t.circle(25.98, 78.22)
        self.t.seth(224.84)
        self.t.circle(10.95, 127.88)
        self.t.end_fill()
        
        self.go(-79.52, -30.64)
        self.t.begin_fill()
        self.t.seth(43.04)
        self.t.circle(10.08, 113.14)
        self.t.seth(154.55)
        self.t.circle(26.35, 60)
        self.t.seth(219.12)
        self.t.circle(9.62, 90)
        self.t.seth(313.32)
        self.t.circle(21.61, 89.72)
        self.t.end_fill()
        
        # Dibujar detalles finales
        self.actualizar_progreso("Añadiendo detalles finales...")
        self.t.pencolor("black")
        self.t.fillcolor("white")
        
        self.go(52.17, -71.53)
        self.t.begin_fill()
        self.t.seth(56.48)
        self.t.circle(-41.155)
        self.t.end_fill()
        
        self.go(52.17, -71.53)
        self.t.seth(235.37)
        self.t.circle(23.90, 164.98)
        self.t.seth(50.62)
        self.t.circle(10.70, 81.85)
        
        self.go(41.96, -26.99)
        self.t.begin_fill()
        self.t.seth(197.01)
        self.t.circle(-394.86, 16.06)
        self.t.seth(215.23)
        self.t.circle(25.44, 72.43)
        self.t.seth(232.24)
        self.t.circle(55.76, 31.75)
        self.t.seth(238.91)
        self.t.circle(-26.90, 71.18)
        self.t.seth(229.02)
        self.t.circle(15.89, 120.9)
        self.t.seth(349.42)
        self.t.circle(62.55, 34.42)
        self.t.seth(336.13)
        self.t.circle(109.16, 36.79)
        self.t.seth(259.29)
        self.t.circle(27.96, 53.73)
        self.t.seth(309.39)
        self.t.circle(17.50, 85.76)
        self.t.seth(85.18)
        self.t.circle(-22.97, 31.31)
        self.t.seth(60.59)
        self.t.circle(91.51, 15.57)
        self.t.seth(31.53)
        self.t.circle(60.12, 91.14)
        self.t.seth(62.33)
        self.t.circle(-69.61, 27.96)
        self.t.seth(347.04)
        self.t.circle(10.24, 165.01)
        self.t.seth(164.03)
        self.t.circle(42.22, 77.17)
        self.t.end_fill()
        
        self.go(-59.31, -57.97)
        self.t.seth(208.74)
        self.t.circle(55.76, 66.4)
        
        self.go(-81.70, -129.58)
        self.t.seth(329.65)
        self.t.circle(109.16, 49.27)
        
        self.go(34.17, -138.64)
        self.t.seth(23.17)
        self.t.circle(60.12, 99.51)
        
        self.go(58.48, -56.57)
        self.t.seth(67.48)
        self.t.circle(-69.61, 33.11)
        
        self.go(38.37, -35.71)
        self.t.seth(74.03)
        self.t.circle(-42.22, 90)
        
        # Mensaje final
        self.t.hideturtle()
        self.actualizar_progreso("¡Dibujo completado! Love you ♥")

    def dibujar_elementos_decorativos(self):
        """Dibuja elementos decorativos alrededor de Cinnamoroll"""
        self.actualizar_progreso("Añadiendo elementos decorativos...")
        
        # Añadir texto decorativo con efecto de sombra primero
        # Primero dibujamos la sombra
        self.t.penup()
        self.t.goto(2, -252)  # Posición ligeramente desplazada para la sombra
        self.t.pendown()
        self.t.color("#d14d7a")  # Color más oscuro para la sombra
        self.t.write("Love you ♥", align="center", font=("Comic Sans MS", 24, "bold"))
        
        # Luego dibujamos el texto principal
        self.t.penup()
        self.t.goto(0, -250)  # Posición ajustada para que no se sobreponga
        self.t.pendown()
        self.t.color("#ff6b9d")  # Color rosa brillante
        self.t.write("Love you ♥", align="center", font=("Comic Sans MS", 24, "bold"))  # Tamaño ajustado
        
        # Dibujar corazón
        self.t.pensize(7)
        self.t.pencolor("Red")
        self.go(41.44, -94.01)
        self.arco(69.76, -94.78, 35.72)
        self.arco(34.04, 1421.55, 2.27)
        self.arco(36.32, 144.27, 57.34)
        self.arco(93.66, 88.76, 65.48)
        self.arco(159.14, 46.59, 67.28)
        self.arco(226.42, 121.8, 41.08)
        self.arco(267.49, 6.59, 169.43)
        self.arco(76.92, 92.51, 58.55)
        self.arco(135.47, 34.47, 107.48)
        self.arco(242.95, 132.63, 48.22)
        self.arco(291.17, 257.98, 15.98)
        self.arco(307.15, -185.99, 21.58)
        
        # Dibujar flores y elementos decorativos
        self.t.pencolor("Black")
        
        # Flor 1
        self.go(-284.66, 17.63)
        self.arco(353.09, 297.11, 13.81)
        self.go(-252.75, 15.5)
        self.arco(288.44, -159.6, 26.37)
        self.arco(262.06, 212.73, 23.42)
        self.go(-274.99, -145.21)
        self.arco(0.63, 360.61, 11.71)
        
        # Flor 2
        self.go(-166.64, -111.77)
        self.arco(49.07, 175.3, 45.09)
        self.arco(94.16, 4.65, 158.97)
        self.arco(253.13, 322.84, 33.46)
        
        # Flor 3
        self.go(-83.36, -95.21)
        self.arco(99.78, 13.81, 95.66)
        self.arco(195.44, 29.27, 102.62)
        self.arco(298.06, 14.91, 103.77)
        self.arco(41.83, 38.38, 57.95)
        
        # Elemento decorativo 1
        self.go(-74.48, -77.25)
        self.linea(301.02, 68.4)
        self.arco(91.21, -389.65, 10.98)
        
        # Elemento decorativo 2
        self.go(-16.21, -92)
        self.arco(341.96, 38.12, 58.33)
        self.arco(40.29, 4.41, 90.75)
        self.arco(131.04, 20.64, 115.43)
        self.arco(246.47, 35.54, 43.6)
        self.arco(290.07, 59.3, 9.13)
        self.arco(299.2, 27.24, 60.81)
        self.arco(0, 29.59, 47.43)
        
        # Elemento decorativo 3
        self.go(67.06, -70.48)
        self.arco(306.86, -206.02, 12.33)
        self.arco(294.53, 33.33, 41.02)
        self.go(124.94, -68.59)
        self.arco(242.67, 183.31, 16)
        self.arco(258.67, -162.37, 18.3)
        self.arco(240.36, -33.87, 95.35)
        
        # Flor 4
        self.go(187.44, -107.14)
        self.arco(90, 26.10, 360)
        
        # Flor 5
        self.go(208.54, -76.64)
        self.arco(258.35, 52.01, 63.8)
        self.arco(322.15, 9.46, 92.3)
        self.arco(54.45, 76.62, 41.53)
        self.arco(275.98, 49.35, 40.9)
        
        self.t.hideturtle()
        self.actualizar_progreso("¡Elementos decorativos completados!")

# Función principal
def main():
    root = tk.Tk()
    app = CinnamorollApp(root)
    root.mainloop()

# Ejecutar la aplicación
if __name__ == "__main__":
    main()