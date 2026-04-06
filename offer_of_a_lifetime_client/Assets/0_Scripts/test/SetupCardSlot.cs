using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class SetupCardSlot : MonoBehaviour
{
    [Header("Настройки слота")]
    public SetupCategory category; // Какую категорию тянет этот слот

    [Header("UI Элементы")]
    public GameObject cardBack; // Объект "Рубашка" карты
    public TextMeshProUGUI titleText; // Текст названия
    public TextMeshProUGUI descriptionText; // Текст истории

    private bool isRevealed = false;

    public void OnSlotClicked()
    {
        // Если карта уже открыта - ничего не делаем
        if (isRevealed) return; 

        // Запрашиваем у менеджера случайную карту этой категории
        GameManager.Instance.DrawSetupCard(this);
    }

    public void RevealCard(SetupCardData data)
    {
        // Заполняем UI
        titleText.text = data.cardName;
        descriptionText.text = data.backgroundStory;
        
        // Прячем рубашку
        cardBack.SetActive(false);
        isRevealed = true;
    }
}