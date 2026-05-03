using UnityEngine.UI;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class GameManager : MonoBehaviour
{
    public ScrollRect logScrollRect;
    public static GameManager Instance;

    public enum GameState { Setup, Playing }
    public GameState currentState;

    [Header("Пулы стартовых карт")]
    public List<SetupCardData> ageCards;
    public List<SetupCardData> skillCards;
    public List<SetupCardData> resourceCards;
    public List<SetupCardData> jobCards;

    [Header("UI Панели")]
    public GameObject setupPanel;
    public GameObject actionPanel;
    public RectTransform playerBarPanel;
    public List<SetupCardSlot> setupCardSlots;

    [Header("UI Элементы игры")]
    public TextMeshProUGUI statsText;
    public TextMeshProUGUI eventLogText;

    [Header("Попапы")]
    public ResultPopup resultPopup;
    public GameOverPanel gameOverPanel;

    [Header("Текущие статы игрока")]
    public int currentMoney = 0;
    public int currentDays = 0;

    [Header("Условие победы")]
    public int targetMoney = 1000;

    private int cardsRevealed = 0;
    private int _attempts = 0;
    private int _successes = 0;

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
        cardsRevealed = 0;
        _attempts = 0;
        _successes = 0;
    }

    public void DrawSetupCard(SetupCardSlot slot)
    {
        if (currentState != GameState.Setup) return;

        SetupCardData drawnCard = null;

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
            slot.RevealCard(drawnCard);
            ApplySetupCardStats(drawnCard);
            cardsRevealed++;

            string body = drawnCard.backgroundStory;
            if (drawnCard.category == SetupCategory.StartingResources)
                body += $"\n\n+{drawnCard.startingMoney}$  |  +{drawnCard.startingDays} дней";
            else if (drawnCard.category == SetupCategory.BasicSkill)
                body += $"\n\nНавык: {drawnCard.skillName}";
            else if (drawnCard.category == SetupCategory.EmploymentStatus)
                body += $"\n\n{(drawnCard.isCurrentlyEmployed ? "Есть работа" : "Безработный")}";

            System.Action onClose = cardsRevealed >= 4 ? (System.Action)StartPlayingPhase : null;
            resultPopup.Show(drawnCard.cardName, body, onClose);
        }
        else
        {
            Debug.LogError($"Нет карт в пуле для категории {slot.category}!");
        }
    }

    private void ApplySetupCardStats(SetupCardData data)
    {
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

    public void PlayActionCard(CardData cardToPlay)
    {
        if (currentState != GameState.Playing) return;

        if (currentMoney >= cardToPlay.moneyCost && currentDays >= cardToPlay.timeCostDays)
        {
            currentMoney -= cardToPlay.moneyCost;
            currentDays -= cardToPlay.timeCostDays;
            _attempts++;

            int roll = Random.Range(1, 21);
            bool success = roll >= cardToPlay.targetRoll;

            if (success)
            {
                _successes++;
                currentMoney += cardToPlay.rewardMoney;
            }

            UpdateUI();

            string title = success ? "Успех!" : "Провал";
            string body = $"{cardToPlay.cardName}\n\nБросок: {roll}  (нужно {cardToPlay.targetRoll})\n\n";
            body += success ? $"+{cardToPlay.rewardMoney}$" : "Ресурсы потрачены зря.";

            LogEvent(success
                ? $"Успех! {cardToPlay.cardName}. Бросок: {roll}. +{cardToPlay.rewardMoney}$"
                : $"Провал! {cardToPlay.cardName}. Бросок: {roll}.");

            resultPopup.Show(title, body, onClose: CheckGameOver, success: success);
        }
        else
        {
            resultPopup.Show("Нет ресурсов", $"Не хватает для: {cardToPlay.cardName}");
        }
    }

    private void CheckGameOver()
    {
        if (currentMoney >= targetMoney)
            gameOverPanel.Show(true, currentMoney, _attempts, _successes);
        else if (currentDays <= 0)
            gameOverPanel.Show(false, currentMoney, _attempts, _successes);
    }

    private void LogEvent(string message)
    {
        eventLogText.text += $"- {message}\n\n";
        Canvas.ForceUpdateCanvases();
        if (logScrollRect != null)
            logScrollRect.verticalNormalizedPosition = 0f;
    }

    private void UpdateUI()
    {
        if (statsText != null)
            statsText.text = $"Деньги: {currentMoney}$ | Дней: {currentDays}";
    }
}
