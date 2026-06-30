/**
 * Solitario 2048 - Juego completo
 * Implementación con JavaScript puro
 */

class Solitario2048 {
    constructor() {
        // Configuración del juego
        this.MAX_CARDS_PER_COLUMN = 8;
        this.WIN_VALUE = 2048;
        this.CARD_VALUES = [2, 4, 8, 16, 32];
        
        // Estado del juego
        this.columns = [[], [], [], []];
        this.score = 0;
        this.currentCard = null;
        this.isGameOver = false;
        this.isVictory = false;
        this.isProcessing = false;
        
        // Elementos DOM
        this.columnElements = document.querySelectorAll('.column-cards');
        this.scoreElement = document.getElementById('score');
        this.currentCardElement = document.getElementById('cardValue');
        this.deckCardElement = document.querySelector('.deck-card');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.victoryModal = document.getElementById('victoryModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.victoryScoreElement = document.getElementById('victoryScore');
        
        // Inicializar
        this.init();
    }
    
    init() {
        // Configurar eventos
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('victoryPlayAgainBtn').addEventListener('click', () => this.resetGame());
        
        // Configurar clics en columnas
        document.querySelectorAll('.column').forEach(column => {
            column.addEventListener('click', (e) => {
                // Evitar que el clic en una carta dispare el evento
                if (e.target.closest('.card')) return;
                const columnIndex = parseInt(column.dataset.column);
                this.handleColumnClick(columnIndex);
            });
        });
        
        // Iniciar juego
        this.resetGame();
    }
    
    resetGame() {
        // Resetear estado
        this.columns = [[], [], [], []];
        this.score = 0;
        this.isGameOver = false;
        this.isVictory = false;
        this.isProcessing = false;
        
        // Ocultar modales
        this.gameOverModal.classList.remove('active');
        this.victoryModal.classList.remove('active');
        
        // Actualizar UI
        this.updateScore();
        this.renderColumns();
        this.generateNewCard();
    }
    
    generateNewCard() {
        // Generar carta aleatoria
        const randomIndex = Math.floor(Math.random() * this.CARD_VALUES.length);
        this.currentCard = this.CARD_VALUES[randomIndex];
        this.currentCardElement.textContent = this.currentCard;
        this.updateCardColor(this.deckCardElement, this.currentCard);
    }
    
    updateCardColor(element, value) {
        // Remover clases de color anteriores
        element.className = element.className.split(' ')
            .filter(cls => !cls.startsWith('card-value-'))
            .join(' ');
        // Agregar clase de color correspondiente
        element.classList.add(`card-value-${value}`);
    }
    
    handleColumnClick(columnIndex) {
        // Validaciones
        if (this.isGameOver || this.isVictory || this.isProcessing || !this.currentCard) return;
        if (this.columns[columnIndex].length >= this.MAX_CARDS_PER_COLUMN) return;
        
        this.isProcessing = true;
        
        // Agregar carta a la columna
        this.columns[columnIndex].push(this.currentCard);
        this.renderColumns();
        
        // Verificar fusiones (pasando la columna y la posición de la nueva carta)
        const newCardPosition = this.columns[columnIndex].length - 1;
        this.performMerges(columnIndex, newCardPosition);
        
        // Verificar victoria
        if (this.checkVictory(columnIndex)) {
            this.isVictory = true;
            this.victoryScoreElement.textContent = this.score;
            setTimeout(() => {
                this.victoryModal.classList.add('active');
                this.isProcessing = false;
            }, 500);
            return;
        }
        
        // Verificar derrota
        if (this.checkGameOver()) {
            this.isGameOver = true;
            this.finalScoreElement.textContent = this.score;
            setTimeout(() => {
                this.gameOverModal.classList.add('active');
                this.isProcessing = false;
            }, 500);
            return;
        }
        
        // Generar nueva carta
        this.generateNewCard();
        this.isProcessing = false;
    }
    
    performMerges(columnIndex, position) {
        if (position <= 0) return;
        
        const currentValue = this.columns[columnIndex][position];
        const belowValue = this.columns[columnIndex][position - 1];
        
        if (currentValue === belowValue) {
            // Fusionar
            const mergedValue = currentValue * 2;
            this.columns[columnIndex][position - 1] = mergedValue;
            this.columns[columnIndex].splice(position, 1);
            
            // Sumar puntos
            this.score += mergedValue;
            this.updateScore();
            
            // Animación de fusión
            this.animateMerge(columnIndex, position - 1);
            
            // Continuar fusionando recursivamente
            this.performMerges(columnIndex, position - 1);
        }
    }
    
    animateMerge(columnIndex, position) {
        const columnElement = this.columnElements[columnIndex];
        const cards = columnElement.querySelectorAll('.card');
        if (cards[position]) {
            cards[position].classList.add('card-merging');
            setTimeout(() => {
                cards[position].classList.remove('card-merging');
            }, 400);
        }
    }
    
    checkVictory(columnIndex) {
        // Verificar si alguna carta en la columna es 2048
        return this.columns[columnIndex].includes(this.WIN_VALUE);
    }
    
    checkGameOver() {
        // Verificar si todas las columnas están llenas y no se pueden fusionar
        for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
            const column = this.columns[colIndex];
            if (column.length < this.MAX_CARDS_PER_COLUMN) {
                return false;
            }
            
            // Verificar si hay fusiones posibles en esta columna
            for (let i = 1; i < column.length; i++) {
                if (column[i] === column[i-1]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    renderColumns() {
        this.columns.forEach((column, index) => {
            const columnElement = this.columnElements[index];
            columnElement.innerHTML = '';
            
            column.forEach((value, pos) => {
                const card = document.createElement('div');
                card.className = `card card-value-${value}`;
                card.textContent = value;
                
                // Si es la última carta agregada, animar
                if (pos === column.length - 1 && !this.isProcessing) {
                    card.style.animation = 'cardAppear 0.3s ease';
                }
                
                columnElement.appendChild(card);
            });
        });
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
}

// Inicializar juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Solitario2048();
});