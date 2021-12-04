# <p align="center"> - Web-Chat - </p>
##### <p align="center"> _Este documento forma parte de la documentación procedimental del proyecto_ </p>
## <p align="center"> Contexto </p>

Tras los descubrimientos de como utilizaba Facebook los datos de sus usuarios muchas empresas desconfían de cualquier sistema de mensajería de terceros.

Una de estas empresas es _Infinity Universe Inc._ . Debido a la importancia de sus comunicaciones y los datos que estas contienen no se pueden permitir que caiga en manos ajenas. Por estas razones, han decidido contratarnos un proyecto de software.


## <p align="center"> Análisis </p>
### <p align="center"> Técnica de Análisis 1 - Planificación Conjunta de Requisitos </p>


El promotor, el director de nuestra empresa de software y algún que otro jefe de proyecto se reunen para determinar ágilmente los requisitos del cliente. Aquí el promotor enuncia los datos del proyecto:

"

Se trata de un sistema de mensajería que funcionará a través de la web, una aplicación web, que incluirá las funcionalidades descritas a continuación:
- Registro de usuarios (los usuarios han de pertener a la organización y utilizar la dirección de correo que la empresa les proporcionó en su momento)

- Login de usuarios

- Métodos de recuperación y cambio de contraseña a través del correo de empresa

- Sistema de búsqueda de usuarios registrados

- La lógica de intercambio de mensajes debe incluir las siguientes características:

    - Crear conversaciones con los distintos usuarios
    - Borrar las conversaciones creadas
    - Mostrar el estado de los mensajes (enviado,recibido o leído)
    - Mostrar la fecha de envío

"

### <p align="center"> Técnica de Análisis 2 - Entrevista con el cliente </p>

El promotor también nos hace llegar este comunicado directo del cliente:


#### <p align="center">Comunicado del cliente (leer con acento estadounidense)</p>
_It's very important to apply responsive design to the project, we would like to operate from differents devices._

_In addition, users should be able to change their profile picture and others date like displayname of their contacts or conversations._

_Nevertheless, we don't need chat groups, I mean those conversations in which many people can participate. Conversations will be one to one, if we can afford for news features at the end of the project we might implement it._




#### <p align="center"> Fin comunicado del cliente </P>

Tras el comunicado del cliente y la reunión con los altos cargos del proyecto se llega a las siguientes conclusiones:

- El ciclo de vida elegido para el proyecto es el iterativo, se realizarán entregas según las características que el cliente quiera añadir al aplicativo.
- La metodología de desarrollo elegida será SCRUM, una metodología ágil y el flujo de trabajo será controlado con un tablero kanban, concretamente el que proporciona la plataforma de Github.
- Tras cada entrega (sprint), se analizará la opinión de los programadores, sobretodo en lo referente a la plataforma sobre la que operará el proyecto, Firebase.
- Una de las limitaciones impuestas por la plataforma es que el diseño de la BBDD debe de ser orientada a objetos, por lo tanto, se ha decidido que, en la medida de lo posible, se aplique este diseño en las distintas partes del software para mayor coherencia.
- Dado el contexto en el que se haya la empresa, todo el software y plugins del mismo se ubicarán bajo el mismo panel de administración de Firebase. Al finalizar el proyecto al completo y el cliente haya expresado y/o firmado su conformidad con el mismo se le proporcionará total acceso y control del panel de administración. Por ende, todos los datos que genere la aplicación, siendo este uno de los requisitos primordiales para el cliente, estarán bajo su total control.
- La primera entrega de la aplicación se hará cuando los usuarios puedan; registrarse, iniciar sesión, buscar usuarios, e intercambiar mensajes. Para cumplir con este plazo de entrega se dispone de 15 días a partir de la recepción del diseño de la interfaz por parte de los diseñadores.
- En el segundo sprint se añadirá la funcionalidad de borrar conversaciones y se dejará preparada la implementación de otras funcionalidades sobre los chats (se debe crear un menú en el elemento chat para poder manipularlo). A través de este menú se podrá renombrar, borrar o bloquear una conversación.
- En el tercer sprint implementaremos las funcionalidades referentes a la personificación del perfil del usuario. El usuario podrá cambiar su imagen de perfil y su contraseña. Para cambiar su imagen de perfil tendrá que subir la nueva imagen.
- En el 4º y último sprint aplicaremos responsive design al diseño de la aplicación para que se pueda usar en diferentes dispositivos.
- Finalmente, se generará la documentación del software que incluirá; documentos generados en el proceso de desarrollo (durante el diseño y pruebas sobretodo), guía introductoria, guía avanzada y una guía de administración que se le entregará al cliente puesto que ellos estarán a cargo de la administración.

PD: El diseñador nos ha pasado algunos diseños que se encuentran en la siguiente URL https://genuine-lamps.com/es/android/1254-the-8-best-texting-apps-for-android.html

![Design 1](https://user-images.githubusercontent.com/59183512/144725133-8de7a385-947a-461f-ab3e-17b8f08d39f3.png)
![Design 2](https://user-images.githubusercontent.com/59183512/144725139-a9965c9c-dfd8-46e9-a1a1-ba4de7603471.png)
![Design 3](https://user-images.githubusercontent.com/59183512/144725145-2d67690d-666a-4974-acfa-ae2c655ffabb.png)
![Design 4](https://user-images.githubusercontent.com/59183512/144725147-1d020c69-72eb-4c86-a6e9-aec02bc726ea.png)
![Design 5](https://user-images.githubusercontent.com/59183512/144725151-8c764d2d-69f1-4f39-a875-16aae53e520c.png)
![Design 6](https://user-images.githubusercontent.com/59183512/144725154-b6889374-1d20-40d8-b2b0-c70d813d7ca8.png)
![Design 7](https://user-images.githubusercontent.com/59183512/144725155-2d9028fa-871f-479a-8915-9db2e84b36b9.png)
