using UnityEngine.UI;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class GameManager : MonoBehaviour
{
    public ScrollRect logScrollRect;
    public static GameManager Instance; // Синглтон для быстрого доступа

    public enum GameState { Setup, Playing }
    public GameState currentState;

    [Header("Пулы стартовых карт")]
    public List<SetupCardData> ageCards;
    public List<SetupCardData> skillCards;
    public List<SetupCardData> resourceCards;
    public List<SetupCardData> jobCards;

    [Header("UI Панели")]
    public GameObject setupPanel;  // Панель подготовки (4 карты)
    public GameObject actionPanel; // Панель действий (коворкинг и тд)
    public RectTransform playerBarPanel; // Бар с картами игрока (всегда виден в Playing)
    public List<SetupCardSlot> setupCardSlots; // 4 слота карт предыстории

    [Header("UI Элементы игры")]
    public TextMeshProUGUI statsText;
    public TextMeshProUGUI eventLogText; // Боковое окно логов

    [Header("Текущие статы игрока")]
    public int currentMoney = 0;
    public int currentDays = 0;
    
    private int cardsRevealed = 0;

    void Awake()
    {
        if (Instance == null)
            Instance = this;
        else
            Destroy(gameObject);
    }

    void Start()
    {
        StartSetupPhase();
    }

    public void StartSetupPhase()
    {
        currentState = GameState.Setup;
        setupPanel.SetActive(true);
        actionPanel.SetActive(false);
        logScrollRect.gameObject.SetActive(false);

        eventLogText.text = "";
    }

    // Вызывается слотом при клике по рубашке
    public void DrawSetupCard(SetupCardSlot slot)
    {
        if (currentState != GameState.Setup) return;

        // Имитация броска d20 для лога
        int roll = Random.Range(1, 21);
        
        SetupCardData drawnCard = null;

        // Выбираем случайную карту из нужного пула
        // Random.Range(0, Count) берет случайный индекс из списка
        switch (slot.category)
        {
            case SetupCategory.AgeAndBackground:
                if (ageCards.Count > 0) drawnCard = ageCards[Random.Range(0, ageCards.Count)];
                break;
            case SetupCategory.BasicSkill:
                if (skillCards.Count > 0) drawnCard = skillCards[Random.Range(0, skillCards.Count)];
                break;
            case SetupCategory.StartingResources:
                if (resourceCards.Count > 0) drawnCard = resourceCards[Random.Range(0, resourceCards.Count)];
                break;
            case SetupCategory.EmploymentStatus:
                if (jobCards.Count > 0) drawnCard = jobCards[Random.Range(0, jobCards.Count)];
                break;
        }

        if (drawnCard != null)
        {
            LogEvent($"Бросок d20: {roll}. Выпало: {drawnCard.cardName}");
            slot.RevealCard(drawnCard);
            ApplySetupCardStats(drawnCard);
            
            cardsRevealed++;
            if (cardsRevealed >= 4)
            {
                LogEvent("Все карты открыты. Переходим к игре!");
                // Здесь можно добавить кнопку "Начать", но пока переключаем автоматически
                Invoke(nameof(StartPlayingPhase), 2f);
            }
        }
        else
        {
            Debug.LogError($"Нет карт в пуле для категории {slot.category}!");
        }
    }

    private void ApplySetupCardStats(SetupCardData data)
    {
        // Добавляем статы только если это карта ресурсов
        if (data.category == SetupCategory.StartingResources)
        {
            currentMoney += data.startingMoney;
            currentDays += data.startingDays;
            UpdateUI();
        }
    }

    public void StartPlayingPhase()
    {
        currentState = GameState.Playing;
        setupPanel.SetActive(false);
        actionPanel.SetActive(true);
        logScrollRect.gameObject.SetActive(true);

        if (playerBarPanel != null)
        {
            foreach (var slot in setupCardSlots)
                slot.transform.SetParent(playerBarPanel, false);
            playerBarPanel.gameObject.SetActive(true);
        }

        LogEvent("Вы в игре. Выберите действие.");
    }

    // --- Логика обычных карт из предыдущего этапа ---
    public void PlayActionCard(CardData cardToPlay)
    {
        if (currentState != GameState.Playing) return;

        if (currentMoney >= cardToPlay.moneyCost && currentDays >= cardToPlay.timeCostDays)
        {
            currentMoney -= cardToPlay.moneyCost;
            currentDays -= cardToPlay.timeCostDays;

            int roll = Random.Range(1, 21);
            LogEvent($"Трата: {cardToPlay.cardName}. Бросок: {roll} (нужно {cardToPlay.targetRoll})");

            if (roll >= cardToPlay.targetRoll)
            {
                LogEvent($"Успех! +{cardToPlay.rewardMoney}$");
                currentMoney += cardToPlay.rewardMoney;
            }
            else
            {
                LogEvent("Провал! Ресурсы потрачены зря.");
            }
            UpdateUI();
        }
        else
        {
            LogEvent("Недостаточно ресурсов!");
        }
    }

    private void LogEvent(string message)
    {
        eventLogText.text += $"- {message}\n\n";
        
        // Принудительно обновляем UI и мотаем вниз
        Canvas.ForceUpdateCanvases();
        if (logScrollRect != null)
        {
            logScrollRect.verticalNormalizedPosition = 0f;
        }
    }

    private void UpdateUI()
    {
        if (statsText != null)
        {
            statsText.text = $"Деньги: {currentMoney}$ | Дней: {currentDays}";
        }
    }
}